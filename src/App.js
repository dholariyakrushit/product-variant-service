import './App.css';
import MonkLogo from './assets/images/monk.svg';
import AddProduct from './components/add-product/AddProduct';

function App() {
  return (
    <div className="App">
      <header className="App-header">
       <img className='logo-header' src={MonkLogo} alt='monk logo' />
       <p className='title-header'>Monk Upsell & Cross-sell</p>
      </header>
      <hr/>
      <AddProduct/>
    </div>
  );
}

export default App;
