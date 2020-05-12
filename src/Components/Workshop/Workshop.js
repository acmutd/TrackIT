import React from "react";
import CanvasJSReact from "../../assets/canvasjs.react";
import StudentBar from "./StudentBar";
import WorkshopLevelBar from "./WorkshopLevelBar";
import ConfirmationDialog from "../Layout/ConfirmationDialog";
import WorkshopEdit from "./WorkshopEdit";

var CanvasJSChart = CanvasJSReact.CanvasJSChart;

/**
 * This component displays the expanded view for a workshop when "Show View" is selected on a <WorkshopBar />
 * Contains summary information about the workshop as well as the graphs
 *
 */
class Workshop extends React.Component {
  constructor(props) {
    super(props);

    //this adds the person name and their progress as (label, y) format datapoints for the CanvasJS graph
    var dps = [];

    var xValues = [];
    var yValues = [];

    for (var i = 0; i < this.props.properties.Number_Of_Levels; i++) {
      let a = i + 1; //make the index start from 0 instead of 1
      xValues.push(a + ""); //convert to string to represent as a label instead of coordinate
      yValues.push(0); //initial count for aggregate
    }

    for (var k = 0; k < this.props.data.Progress.length; k++) {
      yValues[this.props.data.Progress[k] - 1] += 1;
    }

    for (var j = 0; j < xValues.length; j++) {
      dps.push({
        label: xValues[j],
        y: yValues[j],
      });
    }

    this.state = {
      dataArray: dps,
      confirmationDialog: false, //this is whether or not to show a confirmation dialog
      addEditWorkshopDialog: false, //this is whether or not to show the editing dialog
    };
  }

  /**
   * Refreshes all the information displayed when the props change
   * @param {*} prevProps 
   */
  componentDidUpdate(prevProps) {
    if (this.props.data !== prevProps.data) {
      var dps = [];

      var xValues = [];
      var yValues = [];

      for (var i = 0; i < this.props.properties.Number_Of_Levels; i++) {
        let a = i + 1; //make the index start from 0 instead of 1
        xValues.push(a + ""); //convert to string to represent as a label instead of coordinate
        yValues.push(0); //initial count for aggregate
      }

      for (var k = 0; k < this.props.data.Progress.length; k++) {
        yValues[this.props.data.Progress[k] - 1] += 1;
      }

      for (var j = 0; j < xValues.length; j++) {
        dps.push({
          label: xValues[j],
          y: yValues[j],
        });
      }
      this.setState({
        dataArray: dps,
      });
    }
  }

  //this adds the person name and their progress as (label, y) format datapoints for the CanvasJS graph
  //code for parsing and adding dynamic data from here --> http://jsfiddle.net/canvasjs/acf0dx6d/
  //this function does not actually get called
  parseDataPoints = () => {
    var dps = [];
    for (var i = dps.length; i < this.props.data.Students.length; i++)
      dps.push({
        label: this.props.data.Students[i],
        y: this.props.data.Progress[i],
      });

    this.setState({ dataArray: dps });
  }

  /**
   * Link button to function passed in as props
   */
  enableWorkshop = () => {
    this.props.enableWorkshop(this.props.data.Workshop_ID);
  }

  /**
   * Link button to function passed in as props
   */
  disableWorkshop = () => {
    this.props.disableWorkshop(this.props.data.Workshop_ID);
  }

  /**
   * Link button to function passed in as props
   */
  clearAllStudents = () => {
    this.props.clearAllStudents(this.props.data.Workshop_ID);
  }

  /**
   * Link button to function passed in as props
   */
  deleteWorkshop = () => {
    this.showHideDeleteConfirmation();
  }

  /**
   * Link button to function passed in as props
   */
  incrementLevel = () => {
    this.props.incrementLevel(this.props.data.Workshop_ID);
  }

  /**
   * Link button to function passed in as props
   */
  decrementLevel = () => {
    this.props.decrementLevel(this.props.data.Workshop_ID);
  }

  /**
   * Link button to function passed in as props
   */
  addEditWorkshop = () => {
    this.showHideAddEditDialog();
  }

  /**
   * Link button to function passed in as props
   * Only called if submit was pressed
   */
  receiveAddEditWorkshopInformationFromDialog = (
    Workshop_Object,
    wasSubmitPressed
  ) => {
    this.showHideAddEditDialog();
    if (wasSubmitPressed) {
      this.props.addEditWorkshop(Workshop_Object);
    }
  }

  /**
   * Link button to function passed in as props
   */
  exportWorkshop = () => {
    this.props.exportWorkshop(this.props.data.Workshop_ID);
  }

  /**
   * Open up the confirmation dialog for deletion
   */
  showHideDeleteConfirmation = () => {
    this.setState(state => ({
      confirmationDialog: !state.confirmationDialog,
    }));
  }

  /**
   * Open up the workshop editing dialog
   */
  showHideAddEditDialog = () => {
    this.setState(state => ({
      addEditWorkshopDialog: !state.addEditWorkshopDialog,
    }));
  }

  /**
   * Get response from the confirmation dialog on whether to delete the workshop
   */
  getDialogResponse = (bool) => {
    this.showHideDeleteConfirmation();
    if (bool) {
      this.props.deleteWorkshop(this.props.data.Workshop_ID);
    }
  }

  render() {
    //mapping student array into <StudentBar />
    let student_progress = this.props.data.Students.map((item, i) => (
      <StudentBar
        TotalProgress={this.props.properties.Number_Of_Levels}
        Progress={this.props.data.Progress[i]}
        Student_Name={item}
        key={i}
      />
    ));

    //options for the CanvasJS graph, configuration basically
    const options = {
      animationEnabled: true,
      exportEnabled: true,
      theme: "light2", //"light1", "dark1", "dark2"
      title: {
        text: this.props.data.Workshop_ID,
      },
      axisY: {
        valueFormatString: "#",
      },
      data: [
        {
          type: "column", //change type to bar, line, area, pie, etc
          //indexLabel: "{y}", //Shows y value on all Data Points
          indexLabelFontColor: "#5A5757",
          indexLabelPlacement: "outside",
          dataPoints: this.state.dataArray,
        },
      ],
    };

    //confirmation dialog setup
    let titleText = "Confirmation";
    let messageText =
      "Are you sure about performing this action? This action cannot be reversed.";

    return (
      <div>
        <WorkshopLevelBar
          incrementLevel={this.incrementLevel}
          decrementLevel={this.decrementLevel}
          enableWorkshop={this.enableWorkshop}
          disableWorkshop={this.disableWorkshop}
          clearAllStudents={this.clearAllStudents}
          deleteWorkshop={this.deleteWorkshop}
          addEditWorkshop={this.addEditWorkshop}
          exportWorkshop={this.exportWorkshop}
          Workshop_Level={this.props.data.Level_Enabled}
          enabled={this.props.data.Enabled}
          maxLevel={this.props.properties.Number_Of_Levels}
        />
        <div className="floating-icon m-3 mt-5 p-3">
          <CanvasJSChart options={options} />
        </div>
        {student_progress}
        {/* Thw two componenets below are dialogs, modals that appear to receive additional information */}
        <ConfirmationDialog
          isOpen={this.state.confirmationDialog}
          titleText={titleText}
          messageText={messageText}
          handleDialogResponse={this.getDialogResponse}
        />
        <WorkshopEdit
          isOpen={this.state.addEditWorkshopDialog}
          titleText="Workshop Panel"
          messageText="Edit workshop information below"
          submit={this.receiveAddEditWorkshopInformationFromDialog}
          workshop={this.props.properties}
          newWorkshop={false}
        />
      </div>
    );
  }
}

export default Workshop;
