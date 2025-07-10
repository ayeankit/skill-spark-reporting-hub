const app = require('./app');
const { port } = require('./config');

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

app.get('/', (req, res) => {
  res.send('Skill Spark Reporting Hub API is running!');
}); 