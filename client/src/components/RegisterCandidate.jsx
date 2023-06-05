import { useEffect, useState } from "react";
import {Col, Form, Row, Button } from "react-bootstrap";
import axios from "axios";
import Swal from "sweetalert2";

function RegisterCandidate() {
  let [votingOptions, setVotingOptions] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [candidateAddress, setCandidateAddress] = useState('');
  const [votingId, setVotingId] = useState('');

  useEffect(() => {
    axios({
      url: "http://localhost:3000/voting/allVotingsId",
      method: "get",
      params: {
        stage: 0
      }
    })
      .then((result) => {
        setVotingOptions(result.data.allVotingsId);
      })
      .catch((error) => {
        console.log(error.message);
      });
  }, []);

  const register = (e) => {
    e.preventDefault();
    axios({
      url: 'http://localhost:3000/voting/registerCandidate',
      method: 'post',
      data: {
        'adminAddress': localStorage.getItem('address'),
        'candidates': [{
          name,
          email,
          candidateAddress,
          votingId
        }]
      }
    }).then(result => {
      if(result.data.error){
        Swal.fire({
          position: 'top-end',
          icon: 'error',
          title: result.data.error,
          showConfirmButton: false,
          timer: 2000
        });
      }
      else{
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Candidates Registered Successfully.',
          html: `<h5>Transaction Hash : <strong>${result.data.transactionHash}</strong></h5>`,
          showConfirmButton: false,
          timer: 2000
        });
        setTimeout(() => {
          window.location.reload();
        },2100);
      }
    }).catch(e => {
      Swal.fire({
        position: 'top-end',
        icon: 'error',
        title: e.message,
        showConfirmButton: false,
        timer: 2000
      });
    });
  }

  return (
    <Form>
      <Form.Group as={Row} className="mb-4 mt-3" controlId="basicInfo">
        <Row>
          <Form.Label column sm={2}>
            Name
          </Form.Label>
          <Col xs={4}>
            <Form.Control placeholder="Name" onChange={e => setName(e.target.value)}/>
          </Col>

          <Form.Label column sm={2}>
            Email
          </Form.Label>
          <Col xs={4}>
            <Form.Control placeholder="Email" onChange={e => setEmail(e.target.value)}/>
          </Col>
        </Row>
      </Form.Group>
        <Row className="mb-4">
          <Form.Label column sm={4}>
            Wallet Address
          </Form.Label>
          <Col xs={8}>
            <Form.Control placeholder="Wallet Address" onChange={e => setCandidateAddress(e.target.value)}/>
          </Col>
        </Row>
        <Row className="mb-3">
          <Form.Label column sm={4}>
            Election
          </Form.Label>
          <Col xs={8}>
            <select className="form-control" onChange={e => setVotingId(e.target.value)}>
              <option>Select Election</option>
              {votingOptions.map((opt) => (
                <option key={opt._id} value={opt.votingId}>
                  {opt.description}
                </option>
              ))}
              ;
            </select>
          </Col>
        </Row>
        <Button variant="primary" type="submit" onClick={register}>
        Add Candidate
      </Button>
    </Form>
  );
}

export default RegisterCandidate;
