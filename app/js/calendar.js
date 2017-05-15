var today = moment().format();
var events = [
  {
    title: 'Business Lunch',
    start: '2016-12-03T13:00:00',
    constraint: 'businessHours',
    color: '#DC6B2A'
  },
  {
    title: 'Garbage pick up',
    start: '2016-12-13T11:00:00',
    constraint: 'availableForMeeting', // defined below
    color: '#DC6B2A'
  },
  {
    title: 'Conference',
    start: '2016-12-18',
    end: '2016-12-20'
  },
  {
    title: 'Party',
    start: '2016-12-29T20:00:00'
  },

  // areas where "Meeting" must be dropped
  {
    id: 'availableForMeeting',
    start: '2016-12-11T10:00:00',
    end: '2016-12-11T16:00:00',
    rendering: 'background'
  },
  {
    id: 'availableForMeeting',
    start: '2016-12-13T10:00:00',
    end: '2016-12-13T16:00:00',
    rendering: 'background'
  },

  // red areas where no events can be dropped
  {
    start: '2016-12-24',
    end: '2016-12-28',
    overlap: false,
    rendering: 'background',
    color: '#DC6B2A'
  },
  {
    start: '2016-12-06',
    end: '2016-12-08',
    overlap: false,
    rendering: 'background',
    color: '#DC6B2A'
  }
];

$(document).ready(function() {

  $('#calendar').fullCalendar({
    header: {
      left: 'prev,next',
      center: 'title',
      right: ''
    },
    handleWindowResize: true,
    defaultDate: today,
    navLinks: true, // can click day/week names to navigate views
    // businessHours: true, // display business hours
    editable: true,
    events: events
  });

});
