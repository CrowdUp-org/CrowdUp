# 🚀 Quick Test Commands - CrowdUp Design Verification

## ⚡ Super Quick Start (30 secondi)

```bash
# Terminal 1: Avvia il server
npm run dev

# Terminal 2: Apri il browser
open http://localhost:3000
```

**Cosa aspettarti:**
- Header con effetto glassmorphic (sfumato/blur)
- Logo arancione con gradiente
- Navigation pill grigia con 5 icone
- Smooth hover effects
- No console errors

---

## 🔍 Test Automation (1 minuto)

```bash
# Test build
npm run build

# Verifica CSS utilities
grep "glass-effect" src/app/globals.css
grep "focus-ring" src/app/globals.css

# Verifica componenti
grep "glass-effect" src/components/Header.tsx
grep "focus-ring" src/components/Header.tsx
grep "FF992B" src/components/Header.tsx

# Verifica server + rendering
curl -s http://localhost:3000 | grep "glass-effect"
```

**Output atteso:** Tutti i grep trovano i valori

---

## 🎨 Visual Test Checklist (2 minuti)

Apri http://localhost:3000 e verifica:

```
Header/Navbar:
☐ Sfondo semi-trasparente (glassmorphism)
☐ Effetto blur visibile
☐ Logo con gradiente arancione (#FF992B → #FF8400)
☐ Icon glow effect arancione

Navigation Icons:
☐ Background grigio (#909090)
☐ 5 icone presenti (Home, Search, Create, Messages, Profile)
☐ Hover effects smooth
☐ Scale transform on hover (cresce leggermente)

Create Button (+):
☐ Gradiente arancione brillante
☐ Ombra orangeVisibile
☐ Hover state cambia gradiente

Scroll Effects:
☐ Scorri giù
☐ Header background diventa più opaco
☐ Shadow aumenta
☐ Transizione smooth
```

---

## ⌨️ Accessibility Quick Test (1 minuto)

```bash
# Keyboard Navigation
1. Apri http://localhost:3000
2. Premi [TAB] 5-6 volte
3. Verifica:
   ✅ Focus ring arancione visibile su ogni elemento
   ✅ Ordine logico (left to right)
   ✅ Tutti i bottoni raggiungibili
```

---

## 🔧 Developer Tools Checks (2 minuti)

### Chrome DevTools
```
1. Apri http://localhost:3000
2. Premi F12 per DevTools
3. Vai a Console tab
4. Verifica: No red errors
5. Vai a Elements tab
6. Seleziona header (Cmd+Shift+C)
7. Verifica class="... glass-effect shadow-md ..."
```

### Inspect Computed Styles
```
1. Inspect header elemento
2. Vai a Styles panel
3. Cerca:
   ✅ backdrop-filter: blur(5.51px)
   ✅ background: rgba(225, 225, 225, 0.3)
   ✅ box-shadow: 0 0 28px rgba(144,144,144,0.6)
```

---

## 📱 Responsive Design Quick Test (1 minuto)

```bash
# Chrome DevTools responsive mode
1. Apri DevTools (F12)
2. Clicca toggle device toolbar (Cmd+Shift+M)
3. Seleziona:
   ✅ iPhone 12 (375px)
   ✅ iPad (768px)
   ✅ Desktop (1920px)
4. Verifica: Layout non rotto, buttons clickabili
```

---

## 🌐 Browser Testing Checklist (5 minuti)

```bash
# Chrome/Edge
npm run dev
open http://localhost:3000
# Verifica: All effects working ✓

# Safari
open -a Safari http://localhost:3000
# Verifica: All effects working ✓
# Note: Webkit prefixes sono incluse

# Firefox
open -a Firefox http://localhost:3000
# Verifica: All effects working ✓

# Mobile (se disponibile)
# Accedi dal telefono a: http://<YOUR_IP>:3000
# Verifica: Responsiveness OK ✓
```

---

## 📊 Performance Quick Check (1 minuto)

```bash
# Open Lighthouse in Chrome
1. DevTools (F12)
2. Lighthouse tab
3. Click "Analyze page load"
4. Verifica:
   ✅ Performance: 70+
   ✅ Accessibility: 90+
   ✅ Best Practices: 80+
```

---

## 🐛 Quick Troubleshooting

### "Header non ha glassmorphism"
```bash
# Soluzione 1: Hard refresh
Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)

# Soluzione 2: Cancella cache
npx next cache clean
npm run dev

# Soluzione 3: Verifica CSS caricato
curl -s http://localhost:3000 | grep "glass-effect"
```

### "Focus ring non visibile"
```bash
# Prova:
1. Apri DevTools
2. Premi Tab
3. Verifica ring arancione attorno elemento
# Se non vedi: Verifica browser support per :focus-visible
```

### "Colori non giusti"
```bash
# Ispeziona elemento:
1. Inspect header
2. Vedi computed color
3. Compara con: #FF992B (arancione)

# Se sbagliato:
npm run build
npm run dev
# Reload page (Cmd+Shift+R)
```

---

## ✅ Final Verification Workflow

```bash
# Step 1: Build check
npm run build
# Output: ✓ Compiled successfully

# Step 2: Start dev server
npm run dev
# Output: ▲ Next.js 15.3.5 ready on http://localhost:3000

# Step 3: Browser test
open http://localhost:3000
# Verify:
# ✅ Header ha glassmorphism
# ✅ Logo gradiente arancione
# ✅ Navigation icons corretti
# ✅ Buttons hanno hover effects
# ✅ No console errors (F12 > Console)

# Step 4: Accessibility test
# Press [TAB] multiple times
# Verify:
# ✅ Focus ring visibile e arancione
# ✅ Navigation logica

# Step 5: Responsive test
# DevTools responsive (Cmd+Shift+M)
# Test su 375px, 768px, 1920px
# Verify: Layout intatto

# All tests ✅ = PRODUCTION READY!
```

---

## 📋 Complete Test Matrix

| Test | Command | Expected | Status |
|------|---------|----------|--------|
| Build | `npm run build` | ✅ Success | ✅ |
| CSS | `grep glass-effect globals.css` | Found | ✅ |
| Header | Inspect element | glass-effect applied | ✅ |
| Colors | DevTools inspect | #FF992B present | ✅ |
| Keyboard | Press TAB | Focus ring visible | ✅ |
| Hover | Hover buttons | Effects work | ✅ |
| Mobile | 375px viewport | Responsive | ✅ |
| Server | npm run dev | Running | ✅ |
| Console | F12 Console | No errors | ✅ |

---

## 🎯 Success Criteria

✅ Tutti i test sopra passano  
✅ Build compila senza errori  
✅ Nessun console error  
✅ Design visualmente corretto  
✅ Accessibilità OK  
✅ Responsive su tutte le sizes  

---

**Se tutti i test ✅ passano: DESIGN IMPLEMENTATO CORRETTAMENTE!**

Per guide più dettagliate: vedi `VERIFICATION_GUIDE.md`
