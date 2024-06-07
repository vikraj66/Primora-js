const replace = require('replace-in-file');

const options = {
  files: 'dist/**/*.js',
  from: [
    /((import|export)\s.*from\s+['"])(\..*?)(?=['"])/g, // Matches import/export statements
    /((require\(['"])(\..*?)(?=['"]\)))/g               // Matches require statements
  ],
  to: (match, p1, p2, p3) => {
    // Check if the path already ends with '.js', if not, append '.js'
    if (!p3.endsWith('.js')) {
      return `${p1}${p3}.js`;
    }
    return match;
  },
};

replace(options)
  .then(results => {
    console.log('Replacement results:', results);
  })
  .catch(error => {
    console.error('Error occurred:', error);
  });
