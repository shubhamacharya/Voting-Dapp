import {useState} from 'react'
import {Button, Card, Form} from 'react-bootstrap';
import axios from 'axios';
import MyNav from './Nav'
import Swal from 'sweetalert2'

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    axios({
        url: 'http://localhost:3000/voting/login',
        method: 'post',
        data: {
            email,
            password
        }
    }).then(result => {
        if(result.data.error){
          
            Swal.fire({
                title: 'Login Error',
                text: result.data.error,
                icon: 'error',
                confirmButtonText: 'Ok'
            })
        }
        else{
            Swal.fire({
                position: 'top-end',
                icon: 'success',
                title: result.data.message,
                showConfirmButton: false,
                timer: 1500              
            })
            setTimeout(() => {
                localStorage.setItem("user",email);
                window.location.href = result.data.url;
            },1600);
        }
    }).catch(e => {
        console.log(e.message);
    })
  }

  return (
    <>
        <MyNav/>
        <div className='loginForm'>
            <Card className="text-center cardCust" >
                <Card.Body>
                    <Card.Header className='mb-2'>Login</Card.Header>
                    <Card.Text as={"span"}>
                        <Form>
                            <Form.Group className="mb-3" controlId="formBasicEmail">
                                <Form.Label>Email address</Form.Label>
                                <Form.Control type="email" placeholder="Enter email" onChange={e => setEmail(e.target.value)}/>
                            </Form.Group>
    
                            <Form.Group className="mb-3" controlId="formBasicPassword">
                                <Form.Label>Password</Form.Label>
                                <Form.Control type="password" placeholder="Password" onChange={e => setPassword(e.target.value)}/>
                            </Form.Group>
                            <Button variant="primary" type="submit" onClick={handleLogin}>Login</Button>
                        </Form>
                    </Card.Text>
                </Card.Body>
            </Card>
        </div>
        
    </>
  )
}

export default Login