import {useState} from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import axios from "axios";
import Swal from 'sweetalert2';

function ElectionForm() {
  const [votingId, setVotingId] = useState(0);
  const [description, setDescription] = useState('');

  const addElection = (e) => {
    e.preventDefault();
    axios({
      method: 'post',
      url: 'http://localhost:3000/voting/createElection',
      data:
      {
        votingId,
        description,
        adminAddress : localStorage.getItem('address')
      }
    }).then(result => {
      if(result.data.error){
        Swal.fire({
          position: 'top-end',
          icon: 'error',
          title: result.data.error,
          showConfirmButton: false,
          timer: 3000
        });
      }
      else{
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Election Created',
          html: `<h5>Transaction Hash : <strong>${result.data.transactionHash}</strong><h5>`,
          showConfirmButton: false,
          timer: 3000
        });
        setTimeout(() => {
          window.location.reload();
        }, 3100);
      }
    }).catch(e => {
      Swal.fire({
        position: 'top-end',
        icon: 'error',
        title: e.message,
        showConfirmButton: false,
        timer: 3000
      });
    });
  }

  return (
    <Form>
      <Form.Group as={Row} className="mt-3 mb-3" controlId="formBasicEmail">
        <Form.Label column sm={2} className='mb-3'>Voting Id</Form.Label>
        <Col sm={10}>
          <Form.Control type="string" placeholder="Enter voting Id" onChange={e => setVotingId(e.target.value)}/>
        </Col>
      </Form.Group>
      <Form.Group as={Row} className="mb-5" controlId="formBasicPassword">
        <Form.Label column sm={2}>Desription</Form.Label>
        <Col sm={10}>
          <Form.Control type="text" placeholder="Enter election details." onChange={e => setDescription(e.target.value)}/>
        </Col>
      </Form.Group>
      <Button variant="primary" type="submit" onClick={addElection}>
        Create
      </Button>
    </Form>
  );
}

export default ElectionForm;