const Loadfile = async (file) => {
    const readAsDataURL = (file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onerror = () => {
            reader.abort()
            reject()
          }
          reader.addEventListener("load", () => {resolve(reader.result)}, false)
          reader.readAsDataURL(file)
        })
      }
      return readAsDataURL(file);
}

export default Loadfile
