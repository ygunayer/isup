const {checkAll} = require('./index');

checkAll()
  .then(() => {
    console.log('All services are up and available.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Check(s) failed due to', err);
    process.exit(-1);
  });

