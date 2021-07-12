const NETWORK = false // Flips the ip to run through the host network instead of localhost (CORS testing)

module.exports = {
    address: NETWORK ? "192.168.56.1" : "localhost"
}