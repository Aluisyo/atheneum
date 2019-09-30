import React from 'react'
import { getPostTxListByAddress, getDataPost } from './service/arweave';

const BoxItem = props => {
    const { from, txData} = props.data
    return(
      <div style={{marginLeft:'auto', marginRight:'auto', backgroundColor:'#dfe6e9', marginTop:10, marginBottom:10,padding:10}} class="bx--form-item">
        <p style={{padding:10}}>{txData.text}</p>
        {(txData.file.includes("data:application")) &&
        <div style={{marginLeft:'auto', marginRight:'auto'}} class="bx--text-area__wrapper">
          <embed align="center" src={txData.file} id="text-area-3" style={{maxWidth:350, maxHeight:300}} alt="Loaded" />
        </div>
        }     
        <p align="center" style={{padding:5, fontSize:10}}>By:{from}</p> 
      </div>
    )
  }

class SearchBooks extends React.Component{
    state = {
        listData:[],
        userAddress:'',
        load:false
    }

    getPostByAddress = async() => {
        try{
          const listTx = await getPostTxListByAddress(this.state.userAddress)
          let listData = []
          listTx.map(tx => listData.push(getDataPost(tx)))
          const result = await Promise.all(listData)
          if(result.length === 0){
              alert('Not Found')
              return
          }else{
            this.setState({listData:result})
          }
        }catch(err){
          alert('Error')
        }
      }
    

    render(){
        return(
            <div style={{marginLeft:'auto', marginRight:'auto'}} class="bx--form-item bx--text-input-wrapper">
                <label for="text-input-3" class="bx--label">Arweave Address</label>
                <div class="bx--text-input__field-wrapper">
                    <input onChange={(e)=> this.setState({userAddress:e.target.value})} id="text-input-3" type="text" class="bx--text-input" />
                </div>
                <button onClick={this.getPostByAddress} class="bx--btn bx--btn--primary" type="button">Search</button>
                {this.state.listData.map(data => <BoxItem data={data}/>)}
            </div>
        )
    }
}


export default SearchBooks