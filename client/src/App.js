import React, { useRef, useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Table from 'react-bootstrap/Table';
import Whitelist from "./contracts/Whitelist.json";
import getWeb3 from "./getWeb3";
import "./App.css";

const App = () => {
  const [state, setState] = useState({ web3: null, accounts: null, contract: null, whitelist: null })
  const [formValue, setFormValue] = useState('')
  const inputRef1 = useRef();

  useEffect(() => {
    (async () => {
      try {
        // Récupérer le provider web3
        const web3 = await getWeb3();

        // Utiliser web3 pour récupérer les comptes de l’utilisateur (MetaMask dans notre cas) 
        const accounts = await web3.eth.getAccounts();

        // Récupérer l’instance du smart contract “Whitelist” avec web3 et les informations du déploiement du fichier (client/src/contracts/Whitelist.json)
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = Whitelist.networks[networkId];

        const instance = new web3.eth.Contract(
          Whitelist.abi,
          deployedNetwork && deployedNetwork.address,
        );

        // Set web3, accounts, and contract to the state, and then proceed with an
        // example of interacting with the contract's methods.
        await setState({ web3, accounts, contract: instance }) 
        
        

      } catch (error) {
        // Catch any errors for any of the above operations.
        // alert(
        //   `Non-Ethereum browser detected. Can you please try to install MetaMask before starting.`,
        // );
        console.error(error);
      }
    })()
  }, []);

  const runInit = async () => {
    const { accounts, contract } = state;

    // récupérer la liste des comptes autorisés
    const list = await contract.methods.getAddresses().call();
    // Mettre à jour le state 
    setState({ whitelist: list });
  };

  const whitelistContract = async () => {
    const { accounts, contract } = state;
    const address = inputRef1.current.value;


    // Interaction avec le smart contract pour ajouter un compte 
    await contract.methods.whitelist(address).send({ from: accounts[0] });
    // Récupérer la liste des comptes autorisés
    runInit();
  }
console.log(`state.whitelist`, state.whitelist)

  useEffect(() => {
    if (state.contract) runInit()
  }, [state]);


  if (!state.web3) {
    return <div>Loading Web3, accounts, and contract...</div>;
  }

  return (
    <div className="App">
      <div>
        <h2 className="text-center">Système d'une liste blanche</h2>
        <hr></hr>
        <br></br>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Card style={{ width: '50rem' }}>
          <Card.Header><strong>Liste des comptes autorisés</strong></Card.Header>
          <Card.Body>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>@</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.whitelist &&
                      state.whitelist.map((a) => <tr><td>{a}</td></tr>)
                    }
                  </tbody>
                </Table>
              </ListGroup.Item>
            </ListGroup>
          </Card.Body>
        </Card>
      </div>
      <br></br>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Card style={{ width: '50rem' }}>
          <Card.Header><strong>Autoriser un nouveau compte</strong></Card.Header>
          <Card.Body>
            <Form.Group controlId="formAddress">
              <Form.Control type="text" id="address"
                ref={inputRef1}
              />
            </Form.Group>
            <Button onClick={whitelistContract} variant="dark" > Autoriser </Button>
          </Card.Body>
        </Card>
      </div>
      <br></br>
    </div>
  );

}

export default App

