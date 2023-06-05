import axios from 'axios';
import { useEffect, useState } from 'react';
import {Col, FloatingLabel, Form, Row, Button} from 'react-bootstrap';
import Swal from 'sweetalert2';

function ElectionStage() {
    const [votingIdOpt, setVotingIdOpt] = useState([]);    
    const [votingId, setVotingId] = useState([]);
    const [stage, setStage] = useState([]);

    useEffect(() => {
      axios({
        url: 'http://localhost:3000/voting/allVotingsId',
        method: 'get'
      }).then(result => {
        setVotingIdOpt(result.data.allVotingsId);
      }).catch(e => {
        Swal.fire({
          position: 'top-end',
          icon: 'error',
          title: e.message,
          showConfirmButton: false,
          timer: 1500
        });
        console.log(e.message);
      });
    }, []);
    
  const changeState = (e) => {
    e.preventDefault();
    axios({
      url:'http://localhost:3000/voting/changeVotingStage',
      method: 'post',
      data: {
        "votingId": votingId,
        "stage": stage,
        "adminAddress": localStorage.getItem('address')
      }
    }).then(result => {
        if(result.data.error){
          Swal.fire({
            position: 'top-end',
            icon: 'error',
            title: result.data.error,
            showConfirmButton: false,
            timer: 2500
          })
        }else{
          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Election Status Changed',
            text: `${result.data.message}`,
            showConfirmButton: false,
            timer: 2500
          })
        }
    }).catch(e => {
      Swal.fire({
        position: 'top-end',
        icon: 'error',
        title: e.message,
        showConfirmButton: false,
        timer: 2500
      })
    })
  }
  
  return (
    <Row className="g-2">
      <Col md>
        <FloatingLabel controlId="floatingInputGrid" label="Elections">
            <Form.Select onChange={e => setVotingId(e.target.value)}>
                <option>Select Election</option>
                {votingIdOpt.map(opt => (
                    <option key={opt._id} value={opt.votingId}>
                        {opt.description}
                    </option>
                    )   
                )}
            </Form.Select>
        </FloatingLabel>
      </Col>
      <Col md>
        <FloatingLabel
          controlId="floatingSelectGrid"
          label="Election Stages"
        >
          <Form.Select onChange={e => setStage(e.target.value)}>
            <option>Select stage</option>
            <option value="1">Active</option>
            <option value="2">Closed</option>
            <option value="3">Results</option>
          </Form.Select>
        </FloatingLabel>
      </Col>
      <Button variant="primary" type="submit" onClick={changeState}>
        Change State
      </Button>
    </Row>
  );
}

export default ElectionStage;