/* eslint-disable react/prop-types */
import {Button, Modal, Table} from 'react-bootstrap';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useState } from 'react';
import DataTable from 'react-data-table-component';

function sortByProperty(property){  
  return function(a,b){  
     if(a[property] < b[property])  
        return 1;  
     else if(a[property] > b[property])  
        return -1;  
 
     return 0;  
  }  
}

function ElectionsResult({show, onHide, votingRow, result}) {
  const columns = [
    {
      name: 'Name',
      selection: (row) => row.name
    },
    {
      name: 'Email',
      selection: (row) => row.email
    },
    {
      name: 'Address',
      selection: (row) => row.candidateAddress
    },
    {
      name: 'Total Votes',
      selection: (row) => row.votes
    }
  ]

  let [votingResults,setVotingResults] = useState([]);
  
  if(show){

    axios({
      url:'http://localhost:3000/voting/getCandidates',
      method: 'get',
      params:{
          votingId: votingRow.votingId
      }
    }).then(res => {
      let candidateVotes = res.data.candidates.map(candidate => {
        candidate['votes'] = result[candidate.candidateAddress];
        return candidate;
      });

      candidateVotes.sort(sortByProperty('votes'));
      setVotingResults(candidateVotes);

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
          Results for {votingRow.description}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Address</th>
              <th>Votes</th>
            </tr>
          </thead>
          <tbody>
              {votingResults.map(candidateRes => (
                <tr key={candidateRes._id}>
                  <td>{candidateRes.name}</td>
                  <td>{candidateRes.email}</td>
                  <td>{candidateRes.candidateAddress}</td>
                  <td>{candidateRes.votes}</td>
                </tr>
              ))}
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ElectionsResult;