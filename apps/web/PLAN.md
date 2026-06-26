# Mario Cart RSVP front-end

I would like you to scaffold the next/react front-end inside of this folder. 
The site will be relatively simple and will be more focused good UI and will have somewhat simple functionality.

## Routes
There will be the following routes on the page:

Route: `/`
Functionality: The base route. Will have a large graphic with the and will be the title screen. It should have an opening animation revealing the page title "2026 Anual Mario Cart Tournament"
Scrolling down should show additional section which give basic information and link to dedicated pages. Each section here will be a link to the pages below. The style should be mobile first
as most traffic will be mobile but web should be supported. Once scrolled past the main section and the animation completes a top nav will be available to navigate to other screens.

Route: `/RSVP`
Functionality: This is the main functionality of the web app. It will ask the user for Name and phone number this will be used stored in the RSVP table. After confirm two minigames will be given
to determine the seeding for the tournament. First will be a reaction time test where a "Dead by daylight" style time based circle will appear where the user has to press the screen when the
gear/line is within a specific red zone on the circle. The first and second will have one zone and the third will have where two presses are required (two zones). The score is determined by the
total number of accurate time checks (successfully pressed in the touch zone) as well as the cumulative missed distance. The second mini game is self explanitory and will be flappy bird. The speed 
will remain the same throughout and score is based on the number of gates passed. 

The score of each individual game will be stored and once complete a cumulative score is saved. The games will be client side ran and measured and the score saved in the backend. This is to ensure 
performance of the games. Once complete the user will be shown their current seed for the tournament. 

Route: `/history`
Functionality: Will be a static page providing the historical results from previous years. Static

Route: `/rules`
Functionality: Provides the rules of the tournament. Static

Route: `/info1`
Functionality: Info on the tournament location and time. Static

Route: `/standings`
Functionality: The current standings of the RSVP'd players based on the performance in the mini games.

## Style
Page changes will show a cart sliding across the screen pulling a solid background behind which will be the transition between each page. Overall the style will remain clean and professional other than
animations and the color scheme. The color scheme will not be crazy but will utilize the bright colors of mario cart. On a black or white bg. Only sections and accents will use these colors and the rest
the solid black/white base so the design is not too overwhelming. Title text will use the mario cart title style and font where each letter rotates colors. I have two assets but you will need to find
fonts and additional assets to fill the site.

