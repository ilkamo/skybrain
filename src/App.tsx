import React, { useState } from "react";
// import logo from "./logo.svg";
import "./App.css";
import "fontsource-metropolis/all.css";
import User from "./user";

const user = new User();

function App() {
  const [secret, setSecret] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  // const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [displaySuccess, setDisplaySuccess] = useState(false);
  const [userImages, setUserImages] = useState([""]);

  let imageFile: File;

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);

    await user.Login(secret);

    const images = await user.GetImages();
    console.log(images);

    let tempImages: string[] = [];
    images.forEach((img) => {
      tempImages.push("https://siasky.net/" + img.skylink.replace("sia:", ""));
    });

    setUserImages(tempImages);

    setAuthenticated(true);
    setLoading(false);
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    setLoading(true);

    console.log(await user.GetImages())
    if (imageFile) {
      const img = await user.AddImage(imageFile);
      setUserImages([...userImages, "https://siasky.net/" + img.replace("sia:", "")])
      setDisplaySuccess(true);
    }

    setLoading(false);
  };

  const onImageChange = e => {
    const files: File[] = Array.from(e.target.files);

    if (files) {
      if (files[0]) {
        imageFile = files[0];
      }
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        {/* <img src={logo} className="App-logo" alt="logo" /> */}

        <div className="container">
          <h1>Sia Instagram</h1>

          {authenticated ? (
            <div>
              <label htmlFor="output">Upload an image</label>
              <div className="flex">
                <input
                  type="file"
                  onChange={onImageChange}
                />
              </div>
              <div className="mb-4">
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={loading}
                >
                  {loading ? "Uploading..." : "Upload"}
                </button>
                {displaySuccess && (
                  <span className="success-message">Uploaded with success!</span>
                )}
              </div>
              <div>
                {
                  userImages ?
                    userImages.map(
                      (image, index) => <p key={index}><img width="300" key={index} src={image} alt="info"/ ></p>
                    ) : <div></div>
                }
              </div>
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
        </div>
      </header>
    </div>
  );
}

export default App;
