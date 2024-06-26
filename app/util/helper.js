const delay = async (milliseconds) => {
    await new Promise(resolve => setTimeout(resolve, milliseconds));
}

module.exports = delay;