# SuperService App

## Description
Super Service is a React application built with TypeScript and Vite.


## Table of Contents
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Routing Diagram and Corresponding Sections](#routing)
- [Shared Styles Across the Application](#styles)


## Installation

### Prerequisites

Ensure you have the following software installed:
- Node.js (version >= 20.0.0)
- npm or yarn
    
### Cloning the Repository

```bash
git clone https://github.com/yourusername/super-service.git
cd super-service
```

### Dependencies

Install project dependencies using npm or yarn:

```bash
npm install
# or
yarn install
```

## Running the Application

### Development Server

To start the development server, run:

```bash
Copy code
npm run dev
# or
yarn dev
```
The application will be served at http://localhost:3001.

### Building for Production

To build the project for production, run:

```bash
Copy code
npm run build
# or
yarn build
```

## Project Structure

The project structure follows a standard React application layout. Here are the key directories and files:

- src/: Contains the source code for the application.
- public/: Contains static assets and the main HTML file.
- vite.config.ts: Configuration file for Vite bundler.
- tsconfig.json: TypeScript configuration file.

## Configuration

### Environment Variables

The application uses the following environment variables:

- VITE_PUBLIC_API_URL: URL for the public API.
- VITE_ENCRIPTION_KEY: Encryption key for enctypting access and refresh tokens.
Ensure these variables are set before running the application.

## Routing Diagram and Corresponding Sections

### /tickets
- **/**  
  *Tickets views and bin*

- **/{ticket_id}**  
  *Visualize a Ticket, their Client and Contact Business and Send a Message*

### /clients
- **/**  
  *Clients Table*

- **/{client_id}**  
  *Client and their Contact Business Section, Coming from the Clients Table Section*

### /contact_businesses
- **/**  
  *Contact Business Table*

- **/{contact_business_id}**  
  *Contact Bussiness Section*

### /stats
- **/tickets**  
  *Tickets KPI Section*

- **/matilda**  
  *Matilda KPI Section*

- **/users**  
  *Users KPI Section*

### /settings
- **/main**
  *Main settings section. A summary the sections.*

- **/organization/data**
  *Display the data of the organization.*

- **/organization/admin-users**
  *A table where see, edit and delete the organization users.*

- **/organization/tickets**
  *Edit the tickets configuration.*

- **/people/edit-views**
  *Edit the views configuration.*

- **/people/edit-views/{'edit' | 'copy'}/{'shared' | 'private'}/{index}**
  *Edit/Copy/Create a single view.*

- **/people/shortcuts**
  *Add and delete shortcuts.*

- **/channels/web**  
  *Chatbot Settings*

- **/channels/whatsapp**  
  *WhatsApp Accounts Data*

- **/channels/instagram**  
  *Instagram Accounts Data*

- **/channels/google-business**  
  *Google Business Accounts Data*

- **/channels/mail**  
  *Mail Accounts Data*

## Shared Styles Across the Application

To maintain a cohesive and consistent visual design throughout the application, we use a set of shared styles that are applied globally. These include common colors, typography, spacing, shadows, and other design elements. This approach ensures uniformity and improves the maintainability of the codebase.
 
### Color

- Primary text: "black"
- Primary text: "gray.600"
- Text thath will turn black on hover: ""
- For hovering white elements with gray: "brand.hover_gray" (#F2F5F9)
- For important buttons: "brand.gradient_blue" (linear-gradient(to right, rgba(0, 102, 204, 1),rgba(51, 153, 255, 1)))
- For hovering important buttons: "brand.gradient_blue" (linear-gradient(to right, rgba(0, 72, 204, 1),rgba(51, 133, 255, 1)))
- For normal buttons: "gray.200"
- For normal buttons hover: "gray.300"
- For cancel and delete text: "red.500"
- For cancel and delete buttons hover, when white background: "red.100"
- For selected items: "blue.100"
- For selected items hovering: "blue.200"

- ### Box Shadow

- For white items over a white background: "shadow1" (0px 0px 10px rgba(0, 0, 0, 0.15))
- For important floating boxes:  "shadow2" (0px 0px 10px rgba(0, 0, 0, 0.2))
- For dragging components: "dragging-shadow" (0 4px 8px rgba(0, 0, 0, 0.3))

- ### Padding ands gaps

- "px1" (5px) - small components
- "px2" (7px) - items in a list padding
- "px3" (10px) - some gaps
- "px4" (15px) - some gaps and padding for small boxes
- "px5" (20px) - padding for boxes
- "px6" (30px) - padding for big boxes and sections gaps

- ### Border Radius

- ".3rem" - some items and small boxes
- ".5rem" - selectors, inputs, some boxes
- ".7rem" - big boxes
