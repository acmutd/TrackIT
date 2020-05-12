import React from "react";
import WorkshopBar from "../Workshop/WorkshopBar";
import NavBar from "../Layout/NavBar";
import Workshop from "../Workshop/Workshop";
import WorkshopEdit from "../Workshop/WorkshopEdit";
import CardTile from "../Workshop/CardTile";
import { Row, Col, Container } from "react-bootstrap";
import FileSaver from "file-saver";

/**
 * UI component that manages how the admin dashboard looks like
 *
 */
class AdminDashboard extends React.Component {
  constructor(props) {
    super(props);
    console.log("opening dash");

    let openDialog = () => {
      this.showHideAddEditDialog();
    };

    let downloadAllWorkshops = () => {
      this.downloadAllWorkshops();
    };

    //more hard coded data here, this is for the texts present in the cards present on the dashboard
    let cfirst = {
      title: "Admin",
      subtitle: "Administrative Tools",
      description: "Configuration tool for setting up new workshops",
      links: [downloadAllWorkshops, "", openDialog, ""], //functions
      linkText: [
        "Download Workshops",
        "Transfer Workshops",
        "Add Workshop",
        "Delete Workshops",
      ],
    };

    let csecond = {
      title: "Development",
      subtitle: "Development Tools",
      description: "Try out beta tools for customizing trackit",
      links: [], //functions
      linkText: [],
    };

    let cthird = {
      title: "Social",
      subtitle: "Media Tools",
      description: "Access resources and social media",
      links: [], //functions
      linkText: ["Github", "LinkedIn", "Instagram"],
    };

    this.state = {
      workshops: this.props.workshop_data,
      cards: [cfirst, csecond, cthird],
      studentsAtWorkshop: this.props.student_data,
      viewWorkshop: false, //determines whether the expanded view is open or not
      workshopView: 1, //this determines the index of the workshop which has the expanded view

      addWorkshopDialogState: false,
    };
    this.openWorkshopWindow = this.openWorkshopWindow.bind(this);
    this.incrementLevel = this.incrementLevel.bind(this);
    this.decrementLevel = this.decrementLevel.bind(this);
    this.enableWorkshop = this.enableWorkshop.bind(this);
    this.disableWorkshop = this.disableWorkshop.bind(this);
    this.clearAllStudents = this.clearAllStudents.bind(this);
    this.deleteWorkshop = this.deleteWorkshop.bind(this);
    this.addEditWorkshop = this.addEditWorkshop.bind(this);
    this.exportWorkshop = this.exportWorkshop.bind(this);
    this.findWorkshopIndex = this.findWorkshopIndex.bind(this);
    this.receiveAddEditWorkshopInformationFromDialog = this.receiveAddEditWorkshopInformationFromDialog.bind(
      this
    );
    this.showHideAddEditDialog = this.showHideAddEditDialog.bind(this);
    this.findStudentIndex = this.findStudentIndex.bind(this);
    this.downloadAllWorkshops = this.downloadAllWorkshops.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (this.props.student_data !== prevProps.student_data) {
      this.setState({
        studentsAtWorkshop: this.props.student_data,
      });
    }

    if (this.props.workshop_data !== prevProps.workshop_data) {
      this.setState({
        workshops: this.props.workshop_data,
      });
    }
  }

  componentWillUnmount() {
    if (this.props.progressListener) {
      this.props.progressListener();
    }
    if (this.props.workshopListener) {
      this.props.workshopListener();
    }
  }

  /**
   * Changes the viewWorkshop state to true/false, this function is passed in as props to the <WorkshopBar /> Component which will return the its respective Workshop_ID back as param
   *
   * @param {*} Workshop_ID is the name of the workshop that needs to be expanded, received from <WorkshopBar /> Component
   */

  openWorkshopWindow(Workshop_ID) {
    let workshopIndex = this.findWorkshopIndex(Workshop_ID);
    this.setState((state) => ({
      viewWorkshop: !state.viewWorkshop,
      workshopView: workshopIndex,
    }));
  }

  enableWorkshop(Workshop_ID) {
    this.props.updateStatus(Workshop_ID, true);
  }

  disableWorkshop(Workshop_ID) {
    this.props.updateStatus(Workshop_ID, false);
  }

  clearAllStudents(Workshop_ID) {
    this.props.clearWorkshop(Workshop_ID);
  }

  deleteWorkshop(Workshop_ID) {
    let workshopIndex = this.findWorkshopIndex(Workshop_ID);
    let workshopArray = this.state.workshops;
    workshopArray.splice(workshopIndex, 1);
    this.setState(
      {
        viewWorkshop: false, //closes the respective workshop view before deletion
        workshops: workshopArray,
      },
      function () {
        this.props.deleteWorkshop(Workshop_ID);
      }
    );
  }

  incrementLevel(Workshop_ID) {
    let workshopIndex = this.findWorkshopIndex(Workshop_ID);
    this.props.updateLevel(
      Workshop_ID,
      this.state.studentsAtWorkshop[workshopIndex].Level_Enabled + 1
    );
  }

  decrementLevel(Workshop_ID) {
    let workshopIndex = this.findWorkshopIndex(Workshop_ID);
    this.props.updateLevel(
      Workshop_ID,
      this.state.studentsAtWorkshop[workshopIndex].Level_Enabled - 1
    );
  }

  exportWorkshop(Workshop_ID) {
    const index = this.findWorkshopIndex(Workshop_ID);
    let data = this.state.workshops[index];

    // Convert parallel arrays from state to objects for neater export
    let student_data = [];
    for (
      let i = 0;
      i < this.state.studentsAtWorkshop[index].Students.length;
      i++
    ) {
      let student = this.state.studentsAtWorkshop[index].Students[i];
      let progress = this.state.studentsAtWorkshop[index].Progress[i];
      student_data.push({
        student,
        progress,
      });
    }

    // Merging both workshop data and student data into one json object
    let export_data = {
      workshop_data: data,
      student_data: student_data,
    };
    export_data = JSON.stringify(export_data);

    // Create a blob with data
    const jsonBlob = new Blob([export_data], {
      type: "application/json;charset=utf-8;",
    });

    // Send to user for download
    FileSaver.saveAs(jsonBlob, `${Workshop_ID}.json`);
  }

  // Loops through and downloads all workshop data
  downloadAllWorkshops() {
    let big_data = [];
    let student_data = [];

    // Loop through workshops
    for (let i = 0; i < this.state.workshops.length; i++) {
      let data = this.state.workshops[i];

      // Convert parallel arrays from state to objects for neater export
      for (
        let k = 0;
        k < this.state.studentsAtWorkshop[k].Students.length;
        k++
      ) {
        let student = this.state.studentsAtWorkshop[i].Students[k];
        let progress = this.state.studentsAtWorkshop[i].Progress[k];
        student_data.push({
          student,
          progress,
        });
      }

      // Merging both workshop data and student data into one json object that is pushed to the main object
      big_data.push({
        workshop_data: data,
        student_data: student_data,
      });
    }
    big_data = JSON.stringify(big_data);

    // Create a blob with data
    const jsonBlob = new Blob([big_data], {
      type: "application/json;charset=utf-8;",
    });

    // Send to user for download
    FileSaver.saveAs(jsonBlob, `Workshops.json`);
  }

  showHideAddEditDialog() {
    this.setState((state) => ({
      addWorkshopDialogState: !state.addWorkshopDialogState,
    }));
  }

  receiveAddEditWorkshopInformationFromDialog(
    Workshop_Object,
    wasSubmitPressed
  ) {
    this.showHideAddEditDialog();
    if (wasSubmitPressed) {
      this.addEditWorkshop(Workshop_Object);
    }
  }

  addEditWorkshop(Workshop_Object) {
    let workshopIndex = this.findWorkshopIndex(Workshop_Object.Workshop_ID);
    //the slice commands below ensure that when the workshop is saved then only the correct number of levels are passed back
    //For example if the workshop used to have 5 levels but was edited to only have 4 then the slice commands will remove the extra one
    Workshop_Object.Level_Titles = Workshop_Object.Level_Titles.slice(
      0,
      Workshop_Object.Number_Of_Levels
    );
    Workshop_Object.Level_Descriptions = Workshop_Object.Level_Descriptions.slice(
      0,
      Workshop_Object.Number_Of_Levels
    );
    if (workshopIndex === -1) {
      this.props.createWorkshop(Workshop_Object);
    } else {
      this.props.updateWorkshop(Workshop_Object.Workshop_ID, Workshop_Object);
    }
    console.log("test");
  }

  findWorkshopIndex(Workshop_ID) {
    var workshopIndex = -1;
    // loops through array looking for the index that contains inforamtion on that specific workshop, saves that index in workshopView state which then will be passed in as props to the <Workshop /> Component
    for (var i = 0; i < this.state.workshops.length; i++) {
      if (this.state.workshops[i].Workshop_ID === Workshop_ID) {
        workshopIndex = i;
      }
    }
    return workshopIndex;
  }
  findStudentIndex(Workshop_ID) {
    var studentIndex = -1;
    // loops through array looking for the index that contains inforamtion on that specific workshop, saves that index in workshopView state which then will be passed in as props to the <Workshop /> Component
    for (var i = 0; i < this.state.studentsAtWorkshop.length; i++) {
      if (this.state.studentsAtWorkshop[i].Workshop_ID === Workshop_ID) {
        studentIndex = i;
      }
    }
    return studentIndex;
  }

  render() {
    //maps out the array into UI components, this is for the admin page that shows all workshops which is why expandState is set to false
    let workshopList = this.state.workshops.map((item, index) => (
      <WorkshopBar
        expandState={false}
        expandWindow={this.openWorkshopWindow}
        data={item}
        students={this.state.studentsAtWorkshop[index]}
      />
    ));

    //maps out the array into UI components to be displayed in the tiles at the top
    let tiles = this.state.cards.map((item) => (
      <Col>
        <CardTile data={item} />
      </Col>
    ));

    return (
      <div>
        <NavBar dashboard={true} signOut={this.props.signOut} />
        <Container fluid>
          <div className="m-5">
            <Row>{tiles}</Row>
          </div>

          <div className="m-5">
            {/* If the admin dashbaord should be displaying the expanded view of a workshop then it displays the <WorkshopBar /> at the top followed by the <Workshop />, else it displays a list of all the <WorkshopBar /> */}
            {this.state.viewWorkshop ? (
              <div>
                <WorkshopBar
                  expandState={true}
                  expandWindow={this.openWorkshopWindow}
                  data={this.state.workshops[this.state.workshopView]}
                  students={
                    this.state.studentsAtWorkshop[this.state.workshopView]
                  }
                />
                <Workshop
                  incrementLevel={this.incrementLevel}
                  decrementLevel={this.decrementLevel}
                  enableWorkshop={this.enableWorkshop}
                  disableWorkshop={this.disableWorkshop}
                  clearAllStudents={this.clearAllStudents}
                  deleteWorkshop={this.deleteWorkshop}
                  addEditWorkshop={this.addEditWorkshop}
                  exportWorkshop={this.exportWorkshop}
                  properties={this.state.workshops[this.state.workshopView]}
                  data={this.state.studentsAtWorkshop[this.state.workshopView]}
                />
              </div>
            ) : (
              workshopList
            )}
          </div>
          <WorkshopEdit
            isOpen={this.state.addWorkshopDialogState}
            titleText="Workshop Panel"
            messageText="Add workshop information below"
            submit={this.receiveAddEditWorkshopInformationFromDialog}
            newWorkshop={true}
          />
        </Container>
      </div>
    );
  }
}

export default AdminDashboard;
