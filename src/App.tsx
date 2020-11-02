import React, { useState } from "react";
// import logo from "./logo.svg";
import "./App.css";
import "fontsource-metropolis/all.css";
import User from "./user";
import {
  Button,
  FilePicker,
  Heading,
  Pane,
  Spinner,
  TrashIcon,
  UploadIcon,
} from "evergreen-ui";

const user = new User();

function App() {
  const [secret, setSecret] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  // const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [displaySuccess, setDisplaySuccess] = useState(false);
  const [userImages, setUserImages] = useState([""]);

  let imageFile: File;

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);

    await user.Login(secret);

    const images = await user.GetImages();

    let tempImages: string[] = [];
    images.forEach((img) => {
      tempImages.push(img.skylink.replace("sia:", ""));
    });

    setUserImages(tempImages);

    setAuthenticated(true);
    setLoading(false);
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    setUploading(true);

    if (imageFile) {
      const img = await user.AddImage(imageFile);
      setUserImages([img.replace("sia:", ""), ...userImages]);
      setDisplaySuccess(true);
    }

    setUploading(false);
  };

  const onImageDelete = async (event) => {
    const skylink = event.target.id;
    setDeleting(true);
    await user.DeleteImage(skylink);
    const foundIndex = userImages.findIndex((img) => img.search(skylink) > -1);
    if (foundIndex > -1) {
      setUserImages([
        ...userImages.slice(0, foundIndex),
        ...userImages.slice(foundIndex + 1),
      ]);
    }
    setDeleting(false);
  };

  const onImageChange = (files: FileList) => {
    if (files) {
      if (files[0]) {
        imageFile = files[0];
      }
    }
  };

  return (
    <div className="App">
      {/* <img src={logo} className="App-logo" alt="logo" /> */}

      <Pane>
        <Heading textAlign={"center"} size={900} marginTop="default">
          Instasia
        </Heading>
        {authenticated ? (
          <div>
            <Pane elevation={3} marginTop={16} marginBottom={32} padding={32}>
              <Heading size={500} marginBottom={16}>
                Upload a memory
              </Heading>
              <Pane display="flex" alignItems="left">
                <FilePicker
                  multiple={false}
                  width={350}
                  marginBottom={8}
                  onChange={(files) => onImageChange(files)}
                  placeholder="Select the file here!"
                />
                <Button
                  height={32}
                  isLoading={uploading}
                  onClick={handleUpload}
                  marginLeft={16}
                  appearance="primary"
                  intent="success"
                  iconBefore={UploadIcon}
                >
                  Upload
                </Button>
              </Pane>
            </Pane>

            {userImages ? (
              userImages.map((image, index) => {
                let imageWithProtocol =
                  "https://siasky.net/" + image.replace("sia:", "");
                return (
                  <Pane key={index} elevation={3} width={600} marginBottom={36}>
                    <img
                      width="100%"
                      id={image}
                      key={index}
                      src={imageWithProtocol}
                      alt="info"
                    />
                    <Button
                      id={image}
                      isLoading={deleting}
                      margin={12}
                      height={32}
                      onClick={onImageDelete}
                      appearance="minimal"
                      intent="danger"
                      iconBefore={TrashIcon}
                    >
                      Delete
                    </Button>
                  </Pane>
                );
              })
            ) : (
              <div></div>
            )}
          </div>
        ) : (
          <form onSubmit={handleLogin}>
            <div className="mb-2">
              {/* <label htmlFor="output">Nickname</label>
                <div className="flex">
                  <input
                    id="output"
                    type="secret"
                    placeholder="Your nick"
                    value={nickName}
                    onChange={(event) => setNickName(event.target.value)}
                  />
                </div> */}
              <label htmlFor="output">Login passphrase</label>
              <div className="flex">
                <input
                  id="output"
                  type="secret"
                  placeholder="Your very secret passphrase"
                  value={secret}
                  onChange={(event) => setSecret(event.target.value)}
                />
              </div>
            </div>
            <div className="mb-4">
              <button disabled={loading}>
                {loading ? "Logging..." : "Login"}
              </button>
            </div>
          </form>
        )}
      </Pane>
    </div>
  );
}

export default App;
