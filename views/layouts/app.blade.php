<!DOCTYPE html>
<html lang="id" class="h-full scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ $title }} - Bayyinah AI</title>
  <meta name="description" content="Bayyinah adalah AI Agent berbasis Retrieval-Augmented Generation (RAG) untuk pencarian dalil shahih Al-Qur'an dan Kutubut Tis'ah tanpa halusinasi.">
  
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  
  <!-- FontAwesome Icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossorigin="anonymous" referrerpolicy="no-referrer" />

  <!-- Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-P3HB5MJW21"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', 'G-P3HB5MJW21');
  </script>

  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            gemini: {
              bg: '#f8fafc',
              pill: '#ffffff',
              border: '#e2e8f0',
              text: '#1e293b',
              subtext: '#64748b',
              accent: '#2563eb',
              emerald: '#059669',
              emeraldLight: '#10b981'
            }
          },
          fontFamily: {
            sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
            heading: ['Outfit', 'sans-serif'],
            arabic: ['Amiri', 'serif']
          }
        }
      }
    }
  </script>

  <!-- Custom Styles -->
  <link rel="stylesheet" href="/css/style.css">
</head>
<body class="h-full bg-slate-50 text-slate-800 font-sans antialiased overflow-x-hidden flex flex-col selection:bg-emerald-500 selection:text-white">

  @yield('content')

  <!-- Core JS -->
  <script src="/js/app.js"></script>
</body>
</html>
