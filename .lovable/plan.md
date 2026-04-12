

## Ajustar largura do banner na Landing Page

Alinhar o banner superior ("Seja Bem-Vinda, Mulher Plena!") à mesma largura do card "Jornada Essencial" abaixo.

### Mudança no código

Modificar a div do banner em `src/pages/LandingPage.tsx`:

**De:**
```tsx
{/* Banner */}
<div className="w-full">
  <img src={BANNER_URL} alt="Banner" className="w-full h-auto object-contain" />
</div>
```

**Para:**
```tsx
{/* Banner */}
<div className="container mx-auto px-6 pt-6">
  <img src={BANNER_URL} alt="Banner" className="w-full h-auto object-contain rounded-2xl" />
</div>
```

Isso envolve o banner no mesmo container das jornadas, garantindo alinhamento de largura. O `rounded-2xl` foi adicionado para manter consistência visual com o card abaixo.

### Arquivo editado
- `src/pages/LandingPage.tsx` — ajuste no wrapper do banner

