import fs from 'fs';
import path from 'path';
import { Request, Response, NextFunction } from 'express';

export function renderBlade(templatePath: string, data: Record<string, any> = {}): string {
  const viewsDir = path.join(process.cwd(), 'views');
  const fullPath = path.join(viewsDir, templatePath.endsWith('.blade.php') ? templatePath : `${templatePath}.blade.php`);

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Blade template not found: ${fullPath}`);
  }

  let content = fs.readFileSync(fullPath, 'utf8');

  // Handle @extends
  const extendsMatch = content.match(/@extends\(['"]([^'"]+)['"]\)/);
  if (extendsMatch) {
    const parentLayoutPath = extendsMatch[1].replace(/\./g, '/') + '.blade.php';
    const parentFullPath = path.join(viewsDir, parentLayoutPath);
    if (fs.existsSync(parentFullPath)) {
      let parentContent = fs.readFileSync(parentFullPath, 'utf8');

      // Extract sections from child
      const sectionRegex = /@section\(['"]([^'"]+)['"]\)([\s\S]*?)@endsection/g;
      let match;
      const sections: Record<string, string> = {};
      while ((match = sectionRegex.exec(content)) !== null) {
        sections[match[1]] = match[2];
      }

      // Replace @yield in parent
      parentContent = parentContent.replace(/@yield\(['"]([^'"]+)['"]\)/g, (_, sectionName) => {
        return sections[sectionName] || '';
      });

      content = parentContent;
    }
  }

  // Handle @include
  content = content.replace(/@include\(['"]([^'"]+)['"]\)/g, (_, includePath) => {
    const incFullPath = path.join(viewsDir, includePath.replace(/\./g, '/') + '.blade.php');
    if (fs.existsSync(incFullPath)) {
      return fs.readFileSync(incFullPath, 'utf8');
    }
    return '';
  });

  // Simple variable substitution {{ $var }} or {{ var }}
  Object.keys(data).forEach(key => {
    const val = data[key];
    const regex = new RegExp(`{{\\s*\\$${key}\\s*}}`, 'g');
    content = content.replace(regex, String(val));
  });

  // Clean remaining unreplaced Blade directives or variables gracefully
  content = content.replace(/\{\{\s*\$[a-zA-Z0-9_]+\s*\}\}/g, '');

  return content;
}

export function bladeMiddleware(viewsPath: string = 'views') {
  return (req: Request, res: Response, next: NextFunction) => {
    (res as any).renderBlade = (template: string, data: Record<string, any> = {}) => {
      try {
        const html = renderBlade(template, data);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(html);
      } catch (err) {
        next(err);
      }
    };
    next();
  };
}
