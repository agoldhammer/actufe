export const helpitems = [
  {
    id: "help1",
    topic: "Basics",
    description: `News articles are displayed in reverse chronological order, most recent at the top.
    The default time window is 3 hours. This can be changed to 6, 12, or 24 hours with the time window
    selection dropdown. To travel in time, see 'Time Travel.' The page footer displays the start and stop
    times of the current time window, as well as the number of articles in the window and the total number of articles in the database`,
  },
  {
    id: "help2",
    topic: "Publications",
    description: `The left sidebar displays the names of publications with articles in the current time window. Publications can
      be selected/deselected by clicking the checkbox adjacent to the name. The All/None button selects/deselects all
      publications. Checking the 'No summary' box suppresses display of article summaries.`,
  },
  {
    id: "help3",
    topic: "Time Travel",
    description: `To display articles from earlier time frames, press the left 'time travel' button. This will move the time window
    backward in time by an amount equal to the current time window span. To move the window forward in time, press the
    right time arrow button (this will be grayed out if the display is already at the most recent window.)`,
  },
  {
    id: "help4",
    topic: "Category Selection",
    description: `Categories of currently displayed articles are shown in the blue section below the time navigation bar. The categories are generated
      by the ChatGPT3.5-Turbo model and are reasonably accurate, although occasional misclassifications occur. If the AI fails for any reason to
      suggest a category, the article is marked 'uncategorized'. Display can be limited to a particular category by clicking or touching the
      category name. Clicking again, or clicking on another category, will deselect.`,
  },
  {
    id: "help5",
    topic: "Quirks",
    description: `Some articles may appear to be duplicates, but these generally reflect some subtle alteration of the summary text that goes undetected by the
    duplicate elimination algorithm`,
  },
];
