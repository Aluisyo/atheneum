import React from 'react';
import './App.css';
import 'carbon-components/scss/globals/scss/styles.scss';
import {
  Header,
  HeaderName,
  HeaderGlobalBar,
  HeaderMenuItem,
  HeaderNavigation
} from "carbon-components-react/lib/components/UIShell"
import Wallet from './service/Wallet'
import { arweave, getPostTxList, getDataPost, getPostTxListByAddress } from './service/arweave'
import Loadfile from './service/Loadfile';
import Modal from "carbon-components-react/lib/components/Modal"
import Tab from "carbon-components-react/lib/components/Tab"
import Tabs from "carbon-components-react/lib/components/Tabs"
import SearchBooks from './SearchBooks';




const BoxItem = props => {
  const { from, txData} = props.data
  return(
    <div style={{marginLeft:'auto', marginRight:'auto', backgroundColor:'#dfe6e9', marginTop:10, marginBottom:10,padding:10}} class="bx--form-item">
      <p style={{padding:10}}>{txData.text}</p>
      {(txData.file.includes("data:application")) &&
      <div style={{marginLeft:'auto', marginRight:'auto'}} class="bx--text-area__wrapper">
        <embed align="center" src={txData.file} id="text-area-3" style={{Width:350, Height:500}} alt="Loaded" />
      </div>
      } 
      <a href={txData.file} download> Download </a>	  
      <p align="center" style={{padding:5, fontSize:10}}>Uploaded By:{from}</p> 
    </div>
  )
}

const ShowBox = props => {
  if(props.data.length === 0){
    return(
      <div style={{marginLeft:'auto', marginRight:'auto', backgroundColor:'#dfe6e9', marginTop:10, marginBottom:10,padding:10}} class="bx--form-item">
      <p style={{padding:10}}>Nothing to show</p>
      </div>
    )
  }
  return props.data.map(data => <BoxItem data={data}/>)
}
 

class App extends React.Component{
  state = {
    loading:false,
    loadWallet:false,
    walletAddress:'',
    walletBalance:'',
    walletData:false,
    textPost:'',
    filePost:'',
    txModalOpen:false,
    transaction:'',
    fee:'',
    loadingTx:false,
    publicPosts:[],
    userPost:[],
    tab:0
  }

  async componentDidMount(){
    try{
      const data = await this.getPosts()
      this.setState({publicPosts:data})
    }catch(err){

    }
  }

  clickLoadWallet = () => {
    const obj = document.getElementById('wallet-handler')
    obj.click()
    return
  }

  loadWallet = async(e) => {
    try{
      this.setState({loading:true})
      const wallet = await Wallet(e.target.files[0])
      const walletData = JSON.parse(wallet)
      const walletAddress = await arweave.wallets.jwkToAddress(walletData)
      const walletSatoshi =  await arweave.wallets.getBalance(walletAddress)
      const walletBalance = await arweave.ar.winstonToAr(walletSatoshi)
      const userPost = await this.getPostByAddress(walletAddress)
      this.setState({walletData, userPost,walletAddress, walletBalance, loading:false, loadWallet:true})
    }catch(err){
      console.log(err)
      this.setState({loading:false})
      alert('Error Loading Wallet')
    }
  }

  clickLoadfile = () => {
    const obj = document.getElementById('file-handler')
    obj.click()
    return
  }

  loadfile = async(e) => {
    try{
      this.setState({loading:true, fileLoaded:false, filePost:''})
      const pdf = await Loadfile(e.target.files[0])
      console.log(pdf)
      if(pdf.includes("data:application/pdf")){
        this.setState({loading:false, filePost:pdf, fileLoaded:true})
      }else{
        this.setState({loading:false, fileLoaded:false, filePost:''})
        alert('Please upload only pdf files')
      }
    }catch(err){
      console.log(err)
      this.setState({loading:false, fileLoaded:false, filePost:''})
      alert('Error Loading File')
    }
  }

  newPost = async() => {
    try{
      if(!this.state.loadWallet){
        alert('Load your Arweave Wallet to Log in')
        return
      }
      this.setState({loading:true})
      const data = JSON.stringify({
        text:this.state.textPost,
        file:this.state.filePost
      })
      let transaction = await arweave.createTransaction({
          data
      }, this.state.walletData);
      transaction.addTag('App-Name', 'atheneum');      
      transaction.addTag('atheneum', 'post');
      const fee = await arweave.ar.winstonToAr(transaction.reward)
      this.setState({transaction, fee, loading:false, txModalOpen:true})
    }catch(err){
      console.log(err)
      this.setState({loading:false, txModalOpen:false})
      return
    }
  }

  getPosts = async() => {
    try{
      const listTx = await getPostTxList()
      let listData = []
      listTx.map(tx => listData.push(getDataPost(tx)))
      const result = await Promise.all(listData)
      return result
    }catch(err){
      console.log(err)
      return []
    }
  }

  getPostByAddress = async(address) => {
    try{
      const listTx = await getPostTxListByAddress(address)
      let listData = []
      listTx.map(tx => listData.push(getDataPost(tx)))
      const result = await Promise.all(listData)
      return result
    }catch(err){
      return []
    }
  }

  confirmNewPost = async() => {
    try{
      const walletSatoshi =  await arweave.wallets.getBalance(this.state.walletAddress)
      if(parseInt(this.state.transaction.reward)>parseInt(walletSatoshi)){
        alert('Insuficient Balance')
        return
      }
      this.setState({loadingTx:true})
      const transaction = this.state.transaction
      await arweave.transactions.sign(transaction, this.state.walletData);
      await arweave.transactions.post(transaction);
      this.setState({loadingTx:false, txModalOpen:false, textPost:'', transaction:'', fee:'', filePost:''})
      alert('Book uploaded successfuly, Please wait for it to be mined on a block for it to appear in the Library')
    }catch(err){
      alert('Error')
      this.setState({loadingTx:false})
    }
  }

  closeTxModal = () => this.setState({txModalOpen:false})

  render(){
    return(
      <React.Fragment>
        <div>
        <Header>
          <HeaderName href="#" prefix="Atheneum">
          </HeaderName>
		      <HeaderNavigation>
				<HeaderMenuItem href="https://tokens.arweave.org/">Get some free tokens</HeaderMenuItem>			
		  <HeaderGlobalBar>
              {this.state.loadWallet ?
                null
               :                
                <HeaderMenuItem onClick={() => this.clickLoadWallet()}>
                  Load Wallet to log in
                  <input type="file" onChange={ e => this.loadWallet(e)} id="wallet-handler" style={{display: "none"}}/>
                </HeaderMenuItem>
              }
          </HeaderGlobalBar>
              </HeaderNavigation>
        </Header>
        </div>

        <div style={{display: 'flex' , flexDirection:"column",justifyContent: 'space-between', paddingTop:70}}>
          <div style={{marginLeft:'auto', marginRight:'auto'}} class="bx--form-item">
          </div>
           <h1 align="center"> Welcome to Atheneum - The Open, Decentralized and Permanent Library</h1>
		   <div style={{display: 'flex' , flexDirection:"column",justifyContent: 'space-between', paddingTop:70}}>
          <div style={{marginLeft:'auto', marginRight:'auto'}} class="bx--form-item">
          </div>
            <div style={{display: 'flex' , flexDirection:"column",justifyContent: 'space-between'}}>
            <Tabs selected={this.state.tab}>
              <Tab label="Library" onClick={()=>this.setState({tab:0})}/>
              <Tab label="My Book(s)" onClick={()=>this.setState({tab:1})}/>
			  <Tab label="Upload Book" onClick={()=>this.setState({tab:2})}>        
			  {this.state.walletData && 
          <React.Fragment>
            <p align="center" style={{marginTop:50}}>{this.state.walletAddress}</p>
            <p align="center">{this.state.walletBalance} AR</p>
          </React.Fragment>
        }
        <div style={{display: 'flex' , flexDirection:"column",justifyContent: 'space-between', paddingTop:70}}>
          <div style={{marginLeft:'auto', marginRight:'auto'}} class="bx--form-item">
            <label for="text-area-2" class="bx--label">Book Title</label>
            <div class="bx--text-area__wrapper">
              <input value={this.state.textPost} onChange={(e) => this.setState({textPost:e.target.value})} id="text-area-2" class="bx--text-area" rows="4" cols="50" placeholder="Title" ></input>
            </div>
          </div>
          {this.state.filePost &&
          <div style={{marginLeft:'auto', marginRight:'auto'}} class="bx--form-item">
            <label for="text-area-3" class="bx--label">Loaded Book</label>
            <div class="bx--text-area__wrapper">
              <embed src={this.state.filePost} id="text-area-3" style={{maxWidth:350, maxHeight:500}} alt="Loaded" />
            </div>
          </div>
          }
          
          <div style={{marginLeft:'auto', marginRight:'auto'}} class="bx--form-item">
          <button class="bx--btn bx--btn--secondary" onClick={this.clickLoadfile} type="button">Upload Book</button>   
            <input type="file" accept="application/pdf" onChange={ e => this.loadfile(e)} id="file-handler" style={{display: "none"}}/>
          </div>
          <div style={{marginLeft:'auto', marginRight:'auto'}} class="bx--form-item">
            <button onClick={this.newPost} class="bx--btn bx--btn--primary" type="button">Submit Post</button>
          </div>
		  
		  </div>
		  </Tab>
		  <Tab label="Search Book(s)" onClick={()=>this.setState({tab:3})}/>
            </Tabs>
            {(this.state.tab===0) && <ShowBox data={this.state.publicPosts}/>}
            {(this.state.tab===1) && <ShowBox data={this.state.userPost}/>}
			{(this.state.tab===2)}
            {(this.state.tab===3) && <SearchBooks/> }
			
			</div>
          </div>
        </div>
        <Modal open={this.state.txModalOpen}
          modalHeading={"New Upload"}
          primaryButtonText={"Confirm"}
          secondaryButtonText={"Cancel"}
          onRequestSubmit={this.confirmNewPost}
          onSecondarySubmit={this.closeTxModal}

        >
          <div style={{display: 'flex' , flexDirection:"column",justifyContent: 'space-between'}}>
          <div style={{marginLeft:'auto', marginRight:'auto'}}>
            <label for="fee-confirm" class="bx--label">Transaction Fee</label>
            <p id="fee-confirm">{this.state.fee} AR</p>

            <label for="txt-confirm" class="bx--label">Title</label>
            <p id="txt-confirm">{this.state.textPost}</p>

            {this.state.filePost &&
              <div style={{marginLeft:'auto', marginRight:'auto'}} class="bx--form-item">
                <label for="pdf-confirm" class="bx--label">Loaded Book</label>
                <div class="bx--text-area__wrapper">
                  <embed src={this.state.filePost} id="pdf-confirm" style={{maxWidth:350, maxHeight:350}} alt="Loaded" />
                </div>
              </div>
            }
             {this.state.loadingTx &&
                <div class="bx--loading-overlay">
                  <div data-loading class="bx--loading">
                    <svg class="bx--loading__svg" viewBox="-75 -75 150 150">
                      <title>Loading</title>              
                      <circle class="bx--loading__stroke" cx="0" cy="0" r="37.5" />
                    </svg>
                  </div>
                </div>
              }
          </div>
          </div>
        </Modal>
        {this.state.loading &&
        <div class="bx--loading-overlay">
          <div data-loading class="bx--loading">
            <svg class="bx--loading__svg" viewBox="-75 -75 150 150">
              <title>Loading</title>              
              <circle class="bx--loading__stroke" cx="0" cy="0" r="37.5" />
            </svg>
          </div>
        </div>
      }
      </React.Fragment>

    )
  }
}

export default App;
