import { useState, useEffect } from 'react';
import axios from 'axios';
import MyNav from './Nav'
import Button from 'react-bootstrap/Button';
import DataTable from 'react-data-table-component';
import VoteForm from './VoteForm'
import Swal from 'sweetalert2';

function Elections() {
  const [elections, setElections] = useState([]);
  const [modalShow, setModalShow] = useState(false);
  const [selectedVoting, setSelectedVoting] = useState('');

  useEffect(() => {
    axios({
      url: 'http://localhost:3000/voting/allVotingsId',
      method:'get',
      params: {
        "stage":1
      }
    }).then(result => {
      setElections(result.data.allVotingsId);
    }).catch(error => {
      console.log(error.message);
    });
  }, []);

  const handleTokenReq = (row) => {
    axios({
      url: 'http://localhost:3000/voting/requestVotingTokens',
      method: 'post',
      data: {
        emailId: localStorage.getItem('user'),
        signer: localStorage.getItem('address'),
        votingId: row.votingId
      }
    }).then(result => {
      if(result.data.error){
        Swal.fire({
          position: 'top-end',
          icon: 'error',
          title: result.data.error,
          showConfirmButton: false,
          timer: 1500
        })
      }
      else{
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Token Distributed',
          html: <h5>Transaction hash : <strong>{result.data.transactionHash}</strong></h5>,
          showConfirmButton: false,
          timer: 1500
        });
      }
    }).catch(e => {
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: e.message,
        showConfirmButton: false,
        timer: 1500
      });
    });
  }

  const handleVote = (row) => {
    setSelectedVoting(row);
    setModalShow(true)
  }

  const columns = [
    {
      name: 'Id',
      selector: row => row.votingId
    },
    {
      name: 'Name',
      selector: row => row.description
    },
    {
      name: "Request Tokens",
      cell: (row) => (
        <Button onClick={ () => handleTokenReq(row) }>Request</Button>
      )
    },
    {
      name: "Vote",
      cell: (row) => (
        <Button onClick={() => handleVote(row)}>Vote</Button>
      )
    }
  ]
  
  return (
    <>
      <MyNav/>
      <DataTable
        columns={columns}
        data={elections}
        fixedHeader
        highlightOnHover
        selectableRows
        selectableRowsSingle
        selectableRowsHighlight
      ></DataTable>
      <VoteForm
        show={modalShow}
        onHide={() => setModalShow(false)}
        votingRow = {selectedVoting}
      />  
  </>
  );
}

export default Elections;