/**
 * Infrastructure Mappers
 *
 * Barrel export for all database-to-domain mappers.
 */

// Post mappers
export { mapRowToPost, mapPostToInsert, mapPostToUpdate } from './post.mapper';

// User mappers
export {
  mapRowToUser,
  mapUserToPublic,
  mapUserToInsert,
  mapUserToUpdate,
} from './user.mapper';

// Vote mappers
export { mapRowToVote, mapVoteToInsert } from './vote.mapper';

// Comment mappers
export { mapRowToComment, mapCommentToInsert, mapCommentToUpdate } from './comment.mapper';

// Company mappers
export { mapRowToCompany, mapCompanyToInsert, mapCompanyToUpdate } from './company.mapper';

// App mappers
export { mapRowToApp, mapAppToInsert, mapAppToUpdate } from './app.mapper';

// Message mappers
export {
  mapRowToMessage,
  mapMessageToInsert,
  mapRowToConversation,
  mapConversationToInsert,
} from './message.mapper';

// Notification mappers
export {
  mapRowToNotification,
  mapNotificationToInsert,
  type CreateNotificationDTO,
} from './notification.mapper';
