<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{{ $title }}</title>
  <link rel="stylesheet" href="/css/chat.css" />
  <script defer src="/js/chat.js"></script>
  <style>
    /* Fallback dark theme colors for when CSS fails */
    :root { --bg-primary: #0b1120; --bg-secondary: #1a1f2e; --accent: #4caf50; }
  </style>

  <!-- Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-P3HB5MJW21"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', 'G-P3HB5MJW21');
  </script>
</head>
<body class="bg-primary">
  @yield('content')
</body>
</html>
