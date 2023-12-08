# LiveRate-4D

## Description

This is a simple rating app for streamers, enabled with OpenAI vision (gpt-4-vision-preview) to identify items you want to rate. It provides a dashboard to enter your ratings, and a browser source to display those ratings on screen. All ratings are out of 4 stars, and go to 4 decimal places. 

## Features

- Twitch chat integration with tmi.js
- OpenAI gpt-4-vision integration item identification
- Express.js server with Handlebars views
- User authentication with Passport.js
- Socket.IO for real-time communication
- Croppie.js for browser based image cropping
- Simple Bootstrap 5.2 theme

## Installation

To install and run this project, follow these steps:

1. Clone the repository: `git clone https://github.com/kevin-huff/repo.git`
2. Navigate to the project directory: `cd liverate-4d`
3. Install dependencies: `npm install`
4. Rename `example.env` to `.env` and add in your environment variables. (Requires and OpenAI API key)
5. Start the server: `npm start`

## Usage

Dashboard is at `/dashbaord`, browser source for obs is at `/display`. 

### Basic Usage
- Add the browser source to your stream. 
- Type the name of what you are rating and play with the slider to have a the rating show on screen. 
- Saving will send a message in twitch chat. (can configure this in `server.js`)

### Advanced Usage
Let AI describe what you're holding up
- Open up the Screenshot to OpenAI Vision
- Capture the window with your camera (or any window/tab/screen you want to pull an image from)
- Once the capture is live you can then take a screenshot using the button
- Once a screenshot is taken you can then crop it down to the item you want identified. 
- Once cropped you can then send the image to the server
- OpenAI will process the image along with the prompt below the image. (Prompt crafting is the hard part, the default only kinda works sometimes.)
- The Response from OpenAI will be inserted into the "What are you rating?" input field.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the [Unlicense](LICENSE).

## Contact

For any questions or inquiries, please contact the project maintainer at [email@example.com](mailto:email@example.com).
