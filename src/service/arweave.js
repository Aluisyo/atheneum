import Arweave from 'arweave/web';

const arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,           
    protocol: 'https', 
    timeout: 20000,   
    logging: false,    
})


const getPostTxList = async() => {
    try{
      const query = {
            op: 'equals',
            expr1: 'App-Name',
            expr2: 'atheneum'
      }
      const listTxIdPost = await arweave.arql(query);
      return listTxIdPost
    }catch(err){
      console.log(err)
      return []
    }  
}


const getPostTxListByAddress = async(arAddress) => {
    try{
      const query = {
        op: 'and',
        expr1: {
            op: 'equals',
            expr1: 'from',
            expr2: arAddress
        },
        expr2: {
            op: 'equals',
            expr1: 'App-Name',
            expr2: 'atheneum'
        }     
      }
      const listTxIdPost = await arweave.arql(query);
      return listTxIdPost
    }catch(err){
      console.log(err)
      return []
    }  
  }

const getDataPost = async(txId) => {
        return new Promise(async function(resolve, reject){
            try{
              const tx = await arweave.transactions.get(txId)
              const txData = JSON.parse( tx.get('data', {decode: true, string: true}) )
              const from = await arweave.wallets.ownerToAddress(tx.owner)
              resolve({txId, from:from, txData})
            }catch(err){
              resolve({error:true, err})
            }
        })
}

export {
    arweave,
    getPostTxList,
    getPostTxListByAddress,
    getDataPost
}
