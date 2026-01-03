-- Triggers for Company Notifications

-- Function to notify company members when a new post is created about their company
CREATE OR REPLACE FUNCTION notify_company_on_new_post()
RETURNS TRIGGER AS $$
DECLARE
    v_company_id UUID;
    v_member RECORD;
BEGIN
    -- Find company ID based on company name in post
    -- Assuming posts.company matches companies.name (case insensitive?)
    SELECT id INTO v_company_id FROM companies WHERE lower(name) = lower(NEW.company);

    IF v_company_id IS NOT NULL THEN
        -- Loop through company members and create notifications
        FOR v_member IN SELECT user_id FROM company_members WHERE company_id = v_company_id LOOP
            -- Check preferences (optional, but good to have)
            -- For now, just insert
            INSERT INTO notifications (
                recipient_id,
                recipient_type,
                company_id,
                notification_type,
                title,
                message,
                related_post_id,
                priority
            ) VALUES (
                v_member.user_id,
                'company',
                v_company_id,
                'company_post',
                'New post about ' || NEW.company,
                NEW.title,
                NEW.id,
                'medium'
            );
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_company_new_post ON posts;
CREATE TRIGGER trigger_notify_company_new_post
AFTER INSERT ON posts
FOR EACH ROW
EXECUTE FUNCTION notify_company_on_new_post();

-- Function to notify company members and post author on new comment
CREATE OR REPLACE FUNCTION notify_on_new_comment()
RETURNS TRIGGER AS $$
DECLARE
    v_post RECORD;
    v_company_id UUID;
    v_member RECORD;
BEGIN
    -- Get post details
    SELECT * INTO v_post FROM posts WHERE id = NEW.post_id;

    -- 1. Notify Post Author (if not the commenter)
    IF v_post.user_id != NEW.user_id THEN
        INSERT INTO notifications (
            recipient_id,
            recipient_type,
            notification_type,
            title,
            message,
            related_post_id,
            related_comment_id,
            priority,
            actor_id
        ) VALUES (
            v_post.user_id,
            'user',
            'comment',
            'New comment on your post',
            left(NEW.content, 50), -- Truncate content
            NEW.post_id,
            NEW.id,
            'medium',
            NEW.user_id
        );
    END IF;

    -- 2. Notify Company Members (if post is about a company)
    SELECT id INTO v_company_id FROM companies WHERE lower(name) = lower(v_post.company);

    IF v_company_id IS NOT NULL THEN
        FOR v_member IN SELECT user_id FROM company_members WHERE company_id = v_company_id LOOP
            -- Don't notify if the commenter is the member themselves (optional)
            IF v_member.user_id != NEW.user_id THEN
                INSERT INTO notifications (
                    recipient_id,
                    recipient_type,
                    company_id,
                    notification_type,
                    title,
                    message,
                    related_post_id,
                    related_comment_id,
                    priority,
                    actor_id
                ) VALUES (
                    v_member.user_id,
                    'company',
                    v_company_id,
                    'comment',
                    'New comment on a post about ' || v_post.company,
                    left(NEW.content, 50),
                    NEW.post_id,
                    NEW.id,
                    'medium',
                    NEW.user_id
                );
            END IF;
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_new_comment ON comments;
CREATE TRIGGER trigger_notify_new_comment
AFTER INSERT ON comments
FOR EACH ROW
EXECUTE FUNCTION notify_on_new_comment();
