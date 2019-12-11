const {delay, checkAll} = require('./index');

const watchInterval = isNaN(process.argv[2]) ? 0 : Number(process.argv[2]);
if (watchInterval < 1 || watchInterval >= Infinity) {
  throw new Error('Please provide a valid watch interval in milliseconds');
}

async function run() {
  console.log(`Will check service availability every ${watchInterval} milliseconds`);

  let attempts = 0;

  while (true) {
    try {
      await checkAll();
      return; // avoid recursive calls to prevent stack overflow
    } catch (err) {
      console.log(`Attempt #${attempts} failed due to`, err);
      attempts++;
      await delay(watchInterval);
    }
  }
}

run()
  .then(() => {
    console.log('All services are up and available.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Check(s) failed due to', err);
    process.exit(-1);
  });
