import { useState, useEffect } from "react";
import axios from "axios";
import MyNav from "./Nav";
import Button from "react-bootstrap/Button";
import DataTable from "react-data-table-component";
import VoteForm from "./VoteForm";
import Swal from "sweetalert2";
import ElectionsResult from "./ElectionResults";

function Elections() {
  const [elections, setElections] = useState([]);
  const [modalShow, setModalShow] = useState(false);
  const [selectedVoting, setSelectedVoting] = useState("");
  const [results, setResults] = useState([]);
  const [resultModalShow, setResultModalShow] = useState(false);

  useEffect(() => {
    axios({
      url: "http://localhost:3000/voting/allVotingsId",
      method: "get",
      params: {
        stage: [1, 3],
      },
    }).then((result) => {
        setElections(result.data.allVotingsId);
      }).catch((error) => {
        console.log(error.message);
      });
  }, []);

  const handleResult = async (row) => {
    setSelectedVoting(await row);
    await axios({
      url: "http://localhost:3000/voting/getElectionStage",
      method: "get",
      params: {
        votingId: row.votingId,
      },
    }).then(async (resp) => {
      if (resp.data.stage.stage == 3) {
        await axios({
          url: "http://localhost:3000/voting/votesOfAllCandidates",
          method: "get",
          params: {
            votingId: row.votingId,
            sender: localStorage.getItem("address"),
          },
        }).then(async (result) => {
          setResults(result.data.results);
        });
        setResultModalShow(true);
      } else {
        Swal.fire({
          position: "top-end",
          icon: "info",
          title: "Results Not Declared.",
          html: `Results for the <strong>${row.description}</strong> elections are not declared yet.`,
          showConfirmButton: false,
          timer: 3000,
        });
      }
    });
  };

  const handleTokenReq = (row) => {
    axios({
      url: "http://localhost:3000/voting/requestVotingTokens",
      method: "post",
      data: {
        emailId: localStorage.getItem("user"),
        signer: localStorage.getItem("address"),
        votingId: row.votingId,
      },
    })
      .then((result) => {
        if (result.data.error) {
          Swal.fire({
            position: "top-end",
            icon: "error",
            title: result.data.error,
            showConfirmButton: false,
            timer: 3000,
          });
        } else {
          Swal.fire({
            position: "top-end",
            icon: "success",
            title: "Token Distributed",
            html: `<h5>Transaction hash : <strong>${result.data.transactionHash}</strong></h5>`,
            showConfirmButton: false,
            timer: 3000,
          });
        }
      })
      .catch((e) => {
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: e.message,
          showConfirmButton: false,
          timer: 3000,
        });
      });
  };

  const handleVote = (row) => {
    setSelectedVoting(row);
    setModalShow(true);
  };

  const columns = [
    {
      name: "Id",
      selector: (row) => row.votingId,
    },
    {
      name: "Name",
      selector: (row) => row.description,
    },
    {
      name: "Request Tokens",
      cell: (row) => (
        <Button onClick={() => handleTokenReq(row)}>Request</Button>
      ),
    },
    {
      name: "Vote",
      cell: (row) => <Button onClick={() => handleVote(row)}>Vote</Button>,
    },
    {
      name: "Result",
      cell: (row) => <Button onClick={() => handleResult(row)}>Result</Button>,
    },
  ];

  return (
    <>
      <MyNav />
      <div className="m-4">
        <DataTable columns={columns} data={elections} fixedHeader></DataTable>
      </div>
      <VoteForm
        show={modalShow}
        onHide={() => setModalShow(false)}
        votingRow={selectedVoting}
      />
      <ElectionsResult
        show={resultModalShow}
        onHide={() => setResultModalShow(false)}
        votingRow={selectedVoting}
        result={results}
      />
    </>
  );
}

export default Elections;
