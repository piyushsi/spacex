import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Axios from "axios";
import Card from "./Card";
import spaceX from "./spaceX.jpg";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import Loader from "./Common/Loader";
import BottomNavigation from "@material-ui/core/BottomNavigation";
import BottomNavigationAction from "@material-ui/core/BottomNavigationAction";
import RestoreIcon from "@material-ui/icons/Restore";
import StorageIcon from "@material-ui/icons/Storage";
import ClearAllIcon from "@material-ui/icons/ClearAll";
import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import DateRangeIcon from "@material-ui/icons/DateRange";
import CancelIcon from "@material-ui/icons/Cancel";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: "4rem",
  },
  paper: {
    margin: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
  carousel: {
    height: "50vh",
    width: "100%",
  },
  top: {
    ...theme.typography.button,
    padding: theme.spacing(1),
    position: "absolute",
    marginLeft: "auto",
    marginRight: "auto",
    left: 0,
    right: 0,
    top: "15rem",
    color: "#fff",
    fontSize: "2rem",
  },
  center: {
    textAlign: "center",
    color: "#3F51B5",
  },
}));

export default function CenteredGrid() {
  const classes = useStyles();
  const [allLaunches, setAllLaunches] = useState(null);
  const [launches, setLaunches] = useState(null);
  const [value, setValue] = React.useState(0);
  const [dateResultActive, setDateResultActive] = React.useState(null);

  const filterUpcoming = () => {
    let upcoming = allLaunches.filter((launch) => {
      return launch.upcoming;
    });
    setLaunches(upcoming);
  };

  const filterPast = () => {
    let upcoming = allLaunches.filter((launch) => {
      return !launch.upcoming;
    });
    setLaunches(upcoming);
  };

  const filterFailed = () => {
    let failed = allLaunches.filter(
      (launch) =>
        !launch.launch_success && typeof launch.launch_success != "object"
    );
    setLaunches(failed);
  };

  const filterSuccess = () => {
    let success = allLaunches.filter((launch) => launch.launch_success);
    setLaunches(success);
  };

  const [selectedStartDate, setSelectedStartDate] = React.useState(
    new Date("2006-03-25T21:11:54")
  );

  const [selectedEndDate, setSelectedEndDate] = React.useState(new Date());

  const [startDate, setStartDate] = React.useState(null);

  const handleDateChangeStart = (date) => {
    let unixTime = new Date(date).valueOf() / 1000;
    setStartDate(unixTime);
    let filteredLaunch = allLaunches.filter((el) => {
      return el.launch_date_unix >= unixTime;
    });
    setLaunches(filteredLaunch);
    setSelectedStartDate(date);
    setSelectedEndDate(new Date());
  };

  const handleDateChangeEnd = (date) => {
    let unixTime = new Date(date).valueOf() / 1000;
    setSelectedEndDate(date);
    dateWiseResult(unixTime);
  };

  const dateWiseResult = (endDate) => {
    let filteredLaunch = allLaunches
      .filter((el) => el.launch_date_unix >= startDate)
      .filter((el) => el.launch_date_unix <= endDate);
    setLaunches(filteredLaunch);
  };

  useEffect(() => {
    Axios.get("https://api.spacexdata.com/v3/launches").then((res) => {
      setLaunches(res.data);
      setAllLaunches(res.data);
    });
  }, []);
  console.log(allLaunches);
  return (
    <div className={classes.root}>
      {allLaunches ? (
        <Grid container>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <h1 className={classes.top}>
                Total No. of Launches - {allLaunches.length}
                <br />
                <ArrowDownwardIcon />
              </h1>
              <img className={classes.carousel} src={spaceX} />
            </Paper>
            <BottomNavigation
              value={value}
              onChange={(event, newValue) => {
                setValue(newValue);
                setDateResultActive(false);
                setStartDate(null)
              }}
              showLabels
            >
              <BottomNavigationAction
                label="All"
                icon={<StorageIcon />}
                onClick={() => setLaunches(allLaunches)}
              />
              <BottomNavigationAction
                label="Upcoming"
                icon={<RestoreIcon />}
                onClick={() => filterUpcoming()}
              />
              <BottomNavigationAction
                label="Past"
                icon={<ClearAllIcon />}
                onClick={() => filterPast()}
              />
              <BottomNavigationAction
                label="Date Range"
                icon={<DateRangeIcon />}
                onClick={() => setDateResultActive(!dateResultActive)}
              />
              <BottomNavigationAction
                label="Failed Launch"
                icon={<CancelIcon />}
                onClick={() => filterFailed()}
              />
              <BottomNavigationAction
                label="Successful Launch"
                icon={<CheckCircleIcon />}
                onClick={() => filterSuccess()}
              />
            </BottomNavigation>
            {dateResultActive ? (
              <div className={classes.center}>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                    margin="normal"
                    id="date-picker-dialog"
                    label="Start Date"
                    format="MM/dd/yyyy"
                    value={selectedStartDate}
                    onChange={handleDateChangeStart}
                    KeyboardButtonProps={{
                      "aria-label": "change date",
                    }}
                  />
                  {startDate ? (
                    <KeyboardDatePicker
                      margin="normal"
                      id="date-picker-dialog"
                      label="End Date"
                      format="MM/dd/yyyy"
                      value={selectedEndDate}
                      onChange={handleDateChangeEnd}
                      KeyboardButtonProps={{
                        "aria-label": "change date",
                      }}
                    />
                  ) : (
                    ""
                  )}
                </MuiPickersUtilsProvider>
              </div>
            ) : (
              ""
            )}

            <div className={classes.center}>{launches.length} Launches</div>
          </Grid>

          {launches.map((launch) => {
            return (
              <Grid item xs={12} md={3}>
                <Paper className={classes.paper}>
                  <Card data={launch} />
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Loader />
      )}
    </div>
  );
}
