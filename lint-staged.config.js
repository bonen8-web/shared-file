const path = require('path');

module.exports = {
  'frontend/**/*.{ts,tsx,js,jsx}': (filenames) => {
    // Convert to relative paths from frontend folder
    const relativePaths = filenames.map(f => {
      const rel = path.relative(path.join(process.cwd(), 'frontend'), f);
      return rel.replace(/\\/g, '/');
    });
    return `cmd /c "cd frontend && npx eslint --fix --no-warn-ignored ${relativePaths.join(' ')}"`;
  },
  'backend/**/*.py': (filenames) => {
    const relativePaths = filenames.map(f => {
      const rel = path.relative(path.join(process.cwd(), 'backend'), f);
      return rel.replace(/\\/g, '/');
    });
    return [
      `cmd /c "cd backend && python -m black --check ${relativePaths.join(' ')}"`,
      `cmd /c "cd backend && python -m flake8 ${relativePaths.join(' ')}"`
    ];
  }
};
