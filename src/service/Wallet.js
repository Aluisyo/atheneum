const LoadWallet = async (file) => {
    const readAsText = (file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onerror = () => {
            reader.abort()
            reject()
          }
          reader.addEventListener("load", () => {resolve(reader.result)}, false)
          reader.readAsText(file)
        })
      }
      return readAsText(file);
}

export default LoadWallet
