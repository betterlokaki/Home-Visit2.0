/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--neutral-colorbglayout)',
        container: 'var(--neutral-colorbgcontainer)',
        primary: 'var(--color-primary-colorprimary)',
        text: 'var(--color-neutral-text-colortext)',
        'text-solid': 'var(--color-neutral-text-colortextsolid)',
        border: 'var(--color-neutral-icons-borders-colorborder)',
        floating: 'var(--color-neutral-background-colorbgfloating)',
        error: {
          bg: 'var(--color-error-colorerrorbg)',
          border: 'var(--color-error-colorerrorborder)',
          text: 'var(--color-error-colorerrortext)',
        },
        warning: {
          bg: 'var(--color-warning-colorwarningbg)',
          border: 'var(--color-warning-colorwarningborder)',
          text: 'var(--color-warning-colorwarningtext)',
        },
        info: {
          bg: 'var(--color-info-colorinfobg)',
          border: 'var(--color-info-colorinfoborder)',
          text: 'var(--color-info-colorinfotext)',
        },
      },
      spacing: {
        padding: 'var(--size-padding-padding)',
        'padding-xs': 'var(--size-padding-paddingxs)',
        'padding-sm': 'var(--size-padding-paddingsm)',
        'padding-xxs': 'var(--size-padding-paddingxxs)',
      },
      borderRadius: {
        lg: 'var(--style-borderradiuslg)',
        sm: 'var(--style-borderradiussm)',
      },
    },
  },
  plugins: [],
}

