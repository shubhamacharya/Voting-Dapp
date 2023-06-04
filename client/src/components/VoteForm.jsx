/* eslint-disable react/prop-types */
import { Button, Modal, Col, Form, Row, Table } from 'react-bootstrap';
import axios from 'axios';
import { useState } from 'react';
import Swal from 'sweetalert2';

function VoteForm({show, onHide, votingRow}) {
    const [candidates, setCandidates] = useState([]);
    const [selectedCandidate, setSelectedCandidate] = useState('');
    const castVote = (e) => {
        e.preventDefault();
        axios({
            url: 'http://localhost:3000/voting/vote',
            method: 'post',
            data: {
                candidateAddress: selectedCandidate,
                voterAddress: localStorage.getItem('address'),
                votingId: votingRow.votingId
            }
        }).then(result => {
            if(result.data.error){
              Swal.fire({
                position: 'top-end',
                icon: 'error',
                title: result.data.error,
                showConfirmButton: false,
                timer: 1500
              });
            }
            else{
              Swal.fire({
                position: 'top-end',
                icon: 'success',
                title: result.data.message,
                showConfirmButton: false,
                timer: 1500
              });
            }
        }).catch(e => {
          Swal.fire({
            position: 'top-end',
            icon: 'error',
            title: e.message,
            showConfirmButton: false,
            timer: 1500
          });
        });
    }

  if(show){
    axios({
      url:'http://localhost:3000/voting/getCandidates',
      method: 'get',
      params:{
          votingId: votingRow.votingId
      }
    }).then(result => {
      setCandidates(result.data.candidates)
    }).catch(e => {
      Swal.fire({
        position: 'top-end',
        icon: 'error',
        title: e.message,
        showConfirmButton: false,
        timer: 1500
      });
    });
  }

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >   
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
            <Form.Group as={Row} className="mb-3" controlId="formPlaintextPassword">
                <Col sm="10">
                  <Form.Control plaintext readOnly defaultValue={votingRow.description} />
                </Col>
            </Form.Group>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
        <Table striped bordered hover>
      <thead>
        <tr>
          <th></th>
          <th>Name</th>
          <th>Email</th>
          <th>Address</th>
        </tr>
      </thead>
      <tbody>
        {candidates.map((candidate) => (
            <tr key={candidate.candidateAddress}>
                <td>
                    <Form.Check
                        type='radio'
                        id={`default-radio`}
                        name='candidates'
                        value={candidate.candidateAddress}
                        onChange={(e) => setSelectedCandidate(e.target.value)}
                    />
                </td>
                <td>{candidate.name}</td>
                <td>{candidate.email}</td>
                <td>{candidate.candidateAddress}</td>
            </tr>
        ))}
        
      </tbody>
    </Table>
      </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={castVote}>Place Vote</Button>
        <Button onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default VoteForm;
