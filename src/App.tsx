import React, { useState } from "react";
// import logo from "./logo.svg";
import "./App.css";
import "fontsource-metropolis/all.css";
import User from "./user";
import {
  Button,
  FilePicker,
  Heading,
  LogInIcon,
  Pane,
  TextInputField,
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

      <Pane marginLeft={"auto"} marginRight={"auto"}>
        <Heading textAlign={"center"} size={900} marginTop="default">
          Instasia
        </Heading>
        {!authenticated ? (
          <Heading textAlign={"center"} size={500} marginTop={8}>
            Collect your memories!
          </Heading>
        ) : (
          ""
        )}
        {authenticated ? (
          <Pane marginLeft={"auto"} marginRight={"auto"} width={640}>
            <Pane
              elevation={3}
              marginTop={16}
              marginBottom={32}
              padding={32}
              borderRadius={3}
            >
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
                  <Pane key={index} elevation={0} marginBottom={36}>
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
          </Pane>
        ) : (
          <div>
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

            <Pane
              marginLeft={"auto"}
              marginRight={"auto"}
              marginTop={32}
              width={300}
            >
              <Pane>
                <img
                  src="https://source.unsplash.com/collection/1689441/300x200"
                  alt="random"
                />
              </Pane>
              <Pane width={300} elevation={0} padding={24}>
                <TextInputField
                  label="Login passphrase"
                  description="A secure passphrase to login into your account. Remember it! It is the only way to access your stored memories."
                  placeholder="Your very secret passphrase"
                  onChange={(event) => setSecret(event.target.value)}
                  value={secret}
                  type={"password"}
                />
                <Button
                  isLoading={loading}
                  height={48}
                  onClick={handleLogin}
                  appearance="minimal"
                  intent="success"
                  iconBefore={LogInIcon}
                >
                  Login
                </Button>
              </Pane>
            </Pane>
          </div>
        )}
        <Heading textAlign={"center"} size={200} marginTop="default">
          This service works using SkyDB and Skynet technology ❤.
        </Heading>
      </Pane>
    </div>
  );
}

export default App;
