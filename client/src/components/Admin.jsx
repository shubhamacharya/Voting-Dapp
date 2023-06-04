import MyNav from './Nav';
import ElectionForm from './ElectionForm';
import Card from 'react-bootstrap/Card';
import RegisterCandidate from './RegisterCandidate';
import ElectionStage from './ElectionStage';

function Admin() {
  return (
    <>
        <MyNav/>
        <div className='electionForm'>
            <Card style={{ width: '37rem' }}>
              <Card.Body>
                <Card.Title>Create New Election</Card.Title>
                <Card.Text as='span'>
                    <ElectionForm></ElectionForm>
                </Card.Text>
              </Card.Body>
            </Card>
            <Card style={{ width: '37rem' }}>
              <Card.Body>
                <Card.Title>Add Candidates</Card.Title>
                <Card.Text as='span'>
                    <RegisterCandidate></RegisterCandidate>
                </Card.Text>
              </Card.Body>
            </Card>
            <Card style={{ width: '37rem' }}>
              <Card.Body>
                <Card.Title>Change Election Stage</Card.Title>
                <Card.Text as='span'>
                  <ElectionStage></ElectionStage>
                </Card.Text>
              </Card.Body>
            </Card>
        </div>
    </>
  )
}

export default Admin