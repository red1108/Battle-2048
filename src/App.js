import React, { useEffect, useState } from "react";
import { HashRouter as Router, Route } from "react-router-dom";
import { Link } from "react-router-dom";
import Home from "./routes/Home";
import Learn from "./routes/Learn";
import Game from "./routes/Game";
import List from "./routes/List";
import Auth from "./routes/Auth";
import Profile from "./routes/Profile";
import Navbar from "./components/Navigation";
import PrivateRoute from "./helpers/PrivateRoute";
import "./App.css";
import { authService } from "./fbase";

function App() {
    const [init, setInit] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(authService.currentUser);
    const [userObj, setUserObj] = useState(null);

    useEffect(() => {
        authService.onAuthStateChanged((user) => {
            if (user) {
                setIsLoggedIn(true);
                setUserObj(user);
            } else {
                setIsLoggedIn(false);
            }
            setInit(true);
        });
    }, []);

    if (!init) {
        return "initializing...";
    } else {
        return (
            <Router>
                <Link to="/">
                    <img
                        className="logo"
                        src="https://user-images.githubusercontent.com/17401630/130216085-ed20bedc-922c-40ec-945b-026f5fa4dbb0.png"
                        height="72"
                        width="160"
                    />
                </Link>
                <Navbar></Navbar>
                <Route path="/" exact={true} component={Home} />
                <Route path="/learn" exact={true} component={Learn} />
                <PrivateRoute path="/game" component={Game} isLoggedIn={isLoggedIn} userObj={userObj} />
                <PrivateRoute exact={true} path="/list" component={List} isLoggedIn={isLoggedIn} userObj={userObj} />
                <PrivateRoute path="/list/:id" component={Game} isLoggedIn={isLoggedIn} userObj={userObj} />
                <Route path="/auth" component={Auth} />
                <PrivateRoute path="/profile" component={Profile} isLoggedIn={isLoggedIn} userObj={userObj} />
            </Router>
        );
    }
}

export default App;
