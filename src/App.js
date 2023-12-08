import React, { useState, useEffect } from "react";
import "./App.css";
import {
  TextField,
  Autocomplete,
  Typography,
  InputAdornment,
  Container,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  styled,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Chip from "@mui/material-next/Chip";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

// styled load more button
const LoadMoreButton = styled(Button)({
  color: "#d62f56",
  textDecoration: "underline",
  textAlign: "center",
  margin: "16px auto", // Center the button
  display: "flex",
  justifyContent: "center",
});

// style table row odd/even white and grey
const CustomTableRow = styled(TableRow)(({ theme, isOdd }) => ({
  backgroundColor: isOdd ? "white" : theme.palette.grey[200],
}));

// Styled table cell for header
const CustomTableCell = styled(TableCell)({
  border: "2px solid #eeeeee", // Add border to the bottom of each cell
});

// Custom event name link
const EventLink = styled("a")({
  color: "#d62f56",
  textDecoration: "underline",
  cursor: "pointer",
  "&:hover": {
    textDecoration: "none", // Remove underline on hover if desired
  },
});

// Format date to display on accordion
const formatDate = (date) => {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const App = () => {
  const [events, setEvents] = useState([]);

  // Derive groupedEventsArray from events and initialize visible events
  const [groupedEventsArray, setGroupedEventsArray] = useState([]);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [selectedAutocompleteValue, setSelectedAutocompleteValue] =
    useState("");
  const [visibleEvents, setVisibleEvents] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Filter and group events when events state changes
    const filteredEvents = events.filter((event) => {
      const matchesSearch =
        !searchInput ||
        event.event.toLowerCase().includes(searchInput.toLowerCase()) ||
        event.category.toLowerCase().includes(searchInput.toLowerCase());

      const matchesAutocomplete =
        !selectedAutocompleteValue ||
        event.event === selectedAutocompleteValue.event;

      return matchesSearch && matchesAutocomplete;
    });

    // Group events by start date
    // Simply consider all events would be on same day
    const groupedEvents = filteredEvents.reduce((acc, event) => {
      const startDate = event.startDate;
      if (!acc[startDate]) {
        acc[startDate] = { date: new Date(startDate), events: [] };
      }
      acc[startDate].events.push(event);
      return acc;
    }, {});

    const formattedGroups = Object.values(groupedEvents).map((group) => {
      // Sort events within each group by start time, end time, and event name
      group.events.sort(
        (a, b) =>
          new Date(`${a.startDate} ${a.startTime}`) -
          new Date(`${b.startDate} ${b.startTime}`)
      );
      group.events.sort(
        (a, b) =>
          new Date(`${a.startDate} ${a.endTime}`) -
          new Date(`${b.startDate} ${b.endTime}`)
      );
      group.events.sort((a, b) => a.event.localeCompare(b.event));

      return group;
    });

    setGroupedEventsArray(formattedGroups);

    // Initialize visible events with 5 for each group
    setVisibleEvents(
      formattedGroups.reduce((acc, _, index) => {
        acc[index] = 5; // Set the initial visible count for each group
        return acc;
      }, {})
    );
  }, [events, searchInput, selectedAutocompleteValue]);

  //Toggle event selection
  const toggleEventSelection = (eventId) => {
    if (selectedEvents.includes(eventId)) {
      setSelectedEvents((prevSelectedEvents) =>
        prevSelectedEvents.filter((id) => id !== eventId)
      );
    } else {
      setSelectedEvents((prevSelectedEvents) => [
        ...prevSelectedEvents,
        eventId,
      ]);
    }
  };

  //Check if event is selected or not
  const isEventSelected = (eventId) => selectedEvents.includes(eventId);

  // Keep search input value in state for filter events
  const handleSearchChange = (event, newValue) => {
    setSearchInput(newValue);
  };

  // Keep search autocomplete value in state for filter events
  const handleAutocompleteChange = (event, newValue) => {
    if (newValue) {
      setSelectedAutocompleteValue(newValue);
    } else {
      setSelectedAutocompleteValue("");
      setSearchInput("");
    }
  };

  // fetch events data only on mount
  useEffect(() => {
    const url =
      "https://v1.slashapi.com/events/google-sheets/FyqwlUzRL2/reunionevent";
    const options = {
      headers: {
        "X-API-KEY": process.env.REACT_APP_API_KEY,
        "Content-Type": "application/json",
      },
      method: "get",
    };

    const fetchEvents = async () => {
      try {
        const response = await fetch(url, options);
        if (response.ok) {
          const responseData = await response.json();
          setEvents(responseData.data);
          setIsLoading(false);
        } else {
          console.error("Failed to fetch events");
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching events:", error.message);
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Toggle button Attend/Remove
  const handleAttendEvent = (eventId) => {
    // Toggle the selection of the event
    toggleEventSelection(eventId);
  };

  // Load more events per group
  const handleLoadMore = (groupIndex) => {
    setVisibleEvents((prevVisibleEvents) => ({
      ...prevVisibleEvents,
      [groupIndex]: (prevVisibleEvents[groupIndex] || 0) + 5,
    }));
  };

  // Handle case when search input but not selected autcomplete value and clicked clear
  // OnClear event is available for autcomplete
  const handleOnClearInput = (event, value) => {
    if(!value){
      setSelectedAutocompleteValue("");
      setSearchInput("");
    }
  }

  return (
    <Container>
      <Typography
        variant="h4"
        sx={{ my: 5 }}
        style={{ textAlign: "center", color: "#666666" }}
      >
        University Reunion Event
      </Typography>
      {/* Search Component */}
      <Grid
        container
        direction="row"
        justifyContent="center"
        alignItems="center"
        sx={{ my: 5 }}
      >
        <Grid xs={3}>
          <Grid
            container
            direction="row"
            alignItems="center"
            justifyContent="center"
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold" }}
              color="#d62f56"
            >
              Search Events:{" "}
            </Typography>
            <ArrowForwardIosIcon
              fontSize="medium"
              style={{ color: "#d62f56" }}
            />
          </Grid>
        </Grid>
        <Grid xs={9}>
          <Autocomplete
            disablePortal
            freeSolo
            options={events}
            getOptionLabel={(option) => option.event}
            onChange={handleAutocompleteChange}
            onInputChange = {handleOnClearInput}
            renderInput={(params) => {
              return (
                <TextField
                  {...params}
                  placeholder="Search Events..."
                  fullWidth
                  value={searchInput}
                  onChange={(event) =>
                    handleSearchChange(event, event.target.value)
                  }
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        <InputAdornment position="end">
                          <SearchIcon fontSize="large" />
                        </InputAdornment>
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              );
            }}
          />
        </Grid>
      </Grid>

      {selectedEvents.length > 0 && (
        <Grid
          container
          direction="row"
          // justifyContent="center"
          // alignItems="center"
          sx={{ my: 5 }}
        >
          <Grid xs={3}>
            <Grid
              container
              direction="row"
              alignItems="center"
              justifyContent="center"
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold" }}
                color="#d62f56"
              >
                Selected Events:
              </Typography>
            </Grid>
          </Grid>
          <Grid xs={9}>
            {selectedEvents.map((eventId) => {
              const selectedEvent = events.find(
                (event) => event.iD === eventId
              );
              return (
                <Chip
                  key={eventId}
                  size="medium"
                  variant="filled"
                  label={selectedEvent?.event}
                  style={{ color: "#FFFFFF", background: "#d62f56", margin: 2 }}
                  onDelete={() => toggleEventSelection(eventId)}
                />
              );
            })}
          </Grid>
        </Grid>
      )}

      <Grid sx={{ my: 5 }}>
        {!isLoading &&
          groupedEventsArray.map((group, index) => (
            <Accordion key={index} defaultExpanded={true}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                style={{ borderBottom: "5px solid #eeeeee" }}
              >
                <Typography variant="h6" style={{ color: "#666666" }}>
                  {formatDate(group.date)}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <CustomTableCell>Attending</CustomTableCell>
                        <CustomTableCell>Start Time</CustomTableCell>
                        <CustomTableCell>End Time</CustomTableCell>
                        <CustomTableCell>Event Name</CustomTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {group.events
                        .slice(0, visibleEvents[index] || 5)
                        .map((event, eventIndex) => (
                          <CustomTableRow
                            key={event.iD}
                            isOdd={eventIndex % 2 !== 0}
                          >
                            <TableCell>
                              {event.avaiability > 0 ? (
                                <Button
                                  variant="contained"
                                  onClick={() => handleAttendEvent(event.iD)}
                                  style={{ background: "#d62f56" }}
                                >
                                  {isEventSelected(event.iD)
                                    ? "Remove"
                                    : "Attend"}
                                </Button>
                              ) : (
                                "Sold Out"
                              )}
                            </TableCell>
                            <TableCell>{event.startTime}</TableCell>
                            <TableCell>{event.endTime}</TableCell>
                            <TableCell>
                              <EventLink
                                href="#"
                                onClick={() => handleAttendEvent(event.iD)}
                              >
                                {event.event}
                              </EventLink>
                            </TableCell>
                          </CustomTableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
              {group.events.length > (visibleEvents[index] || 5) && (
                <LoadMoreButton onClick={() => handleLoadMore(index)}>
                  Load More
                </LoadMoreButton>
              )}
            </Accordion>
          ))}
        {isLoading && (
          <Typography
            variant="h6"
            textAlign="center"
            style={{ color: "#666666" }}
          >
            Data is loading...
          </Typography>
        )}
        {(!isLoading && groupedEventsArray.length === 0) && (
          <Typography
            variant="h6"
            textAlign="center"
            style={{ color: "#666666" }}
          >
            No results found.
          </Typography>
        )}
      </Grid>
    </Container>
  );
};

export default App;
