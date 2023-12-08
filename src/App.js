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

const LoadMoreButton = styled(Button)({
  color: "#d62f56",
  textDecoration: "underline",
  textAlign: "center",
  margin: "16px auto", // Center the button
  display: "flex",
  justifyContent: "center",
});

const CustomTableRow = styled(TableRow)(({ theme, isOdd }) => ({
  backgroundColor: isOdd ? "white" : theme.palette.grey[200],
}));

const CustomTableCell = styled(TableCell)({
  border: "2px solid #eeeeee", // Add border to the bottom of each cell
});

const EventLink = styled("a")({
  color: "#d62f56",
  textDecoration: "underline",
  cursor: "pointer",
  "&:hover": {
    textDecoration: "none", // Remove underline on hover if desired
  },
});

const App = () => {
  const [events, setEvents] = useState([]);
  const [visibleEvents, setVisibleEvents] = useState(5);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [selectedAutocompleteValue, setSelectedAutocompleteValue] =
    useState("");

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

  const isEventSelected = (eventId) => selectedEvents.includes(eventId);

  const handleSearchChange = (event, newValue) => {
    setSearchInput(newValue);
  };

  const handleAutocompleteChange = (event, newValue) => {
    if (newValue) {
      setSelectedAutocompleteValue(newValue);
    } else {
      setSelectedAutocompleteValue("");
      setSearchInput("");
    }
  };

  // Filter events based on both search input and Autocomplete selection
  const getFilteredEvents = events.filter((event) => {
    const matchesSearch =
      !searchInput ||
      event.event.toLowerCase().includes(searchInput.toLowerCase()) ||
      event.category.toLowerCase().includes(searchInput.toLowerCase());

    const matchesAutocomplete =
      !selectedAutocompleteValue ||
      event.event === selectedAutocompleteValue.event;

    return matchesSearch && matchesAutocomplete;
  });

  const groupedEvents = getFilteredEvents.reduce((acc, event) => {
    const startDate = event.startDate;
    if (!acc[startDate]) {
      acc[startDate] = { date: new Date(startDate), events: [] };
    }
    acc[startDate].events.push(event);
    return acc;
  }, {});

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Sort events within each group by start time (ascending)
  Object.values(groupedEvents).forEach((group) => {
    group.events.sort(
      (a, b) =>
        new Date(`${a.startDate} ${a.startTime}`) -
        new Date(`${b.startDate} ${b.startTime}`)
    );
  });

  // Sort events within each group by end time (ascending)
  Object.values(groupedEvents).forEach((group) => {
    group.events.sort(
      (a, b) =>
        new Date(`${a.startDate} ${a.endTime}`) -
        new Date(`${b.startDate} ${b.endTime}`)
    );
  });

  // Sort events within each group by event name (ascending)
  Object.values(groupedEvents).forEach((group) => {
    group.events.sort((a, b) => a.event.localeCompare(b.event));
  });

  const groupedEventsArray = Object.values(groupedEvents);

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
        } else {
          console.error("Failed to fetch events");
        }
      } catch (error) {
        console.error("Error fetching events:", error.message);
      }
    };

    fetchEvents();
  }, []);

  const handleAttendEvent = (eventId) => {
    // Toggle the selection of the event
    toggleEventSelection(eventId);
  };

  const handleLoadMore = () => {
    setVisibleEvents((prevVisibleEvents) => prevVisibleEvents + 5);
  };

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
        {groupedEventsArray.map((group, index) => (
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
                      .slice(0, visibleEvents)
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
            {group.events.length > visibleEvents && (
              <LoadMoreButton onClick={handleLoadMore}>
                Load More
              </LoadMoreButton>
            )}
          </Accordion>
        ))}
      </Grid>
    </Container>
  );
};

export default App;
