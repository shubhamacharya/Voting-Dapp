import { useState, useEffect } from "react";
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { ethEnabled } from '../utils';

function MyNav() {
  const [address, setAddress] = useState("");
  useEffect( () => {

    const accountHandle = async () => {
      if(address === "")
      {
        setAddress(await ethEnabled());
      }
    }
    accountHandle();
  },[])
  
  return (
    <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand href="/">
            Voting Portal
          </Navbar.Brand>
          {/* <Nav.Item>
            <Nav.Link href="/admin"><span className="adminLink">Admin</span></Nav.Link>
          </Nav.Item> */}
          <Nav.Item>
            {address === '' ? 
            <span className="address">Address Here</span> : 
            <span className="address">{address.slice(0,6)+'....'+address.slice(36)}</span>}
            
          </Nav.Item>
        </Container>
      </Navbar>
  );
}

export default MyNav;