import "../styles/ProfileFriendItem.css";
import { useSelector } from "react-redux";
import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { media } from "../scripts/scripts";
import blankUser from "../images/blank-user.png";
import RelationshipBtn from "./RelationshipBtn";

function ProfileFriendItem({ user, query }) {
  const me = useSelector((state) => state.me);
  const [mutualCount, setMutualCount] = useState(0);
  const [isShown, setIsShown] = useState(true);

  const abortFetchEnabledRef = useRef(false);
  const fetchControllerRef = useRef(new AbortController());

  const fetchMutualsCount = useCallback(async () => {
    if (me && me.user && me.user._id === user._id) {
      return;
    }

    const url = `${process.env.REACT_APP_API_BASE_URL}/api/users/${user._id}/mutuals`;
    const headers = {
      Authorization: "Bearer " + me.token,
    };

    try {
      const response = await fetch(url, {
        headers,
        signal: fetchControllerRef.current.signal,
      });
      const resObj = await response.json();
      if (Array.isArray(resObj)) {
        setMutualCount(resObj.length);
      }
    } catch (error) {
      if (!error.toString().includes("The user aborted a request")) {
        console.log("error", error);
      }
    }
  }, [me,user._id]);

  useEffect(() => {
    const controller = fetchControllerRef.current;

    // Set a timeout to enable aborting the fetch request
    const timer = setTimeout(() => {
      abortFetchEnabledRef.current = true;
    }, 1);

    fetchMutualsCount();

    // Cleanup function to abort the fetch if allowed
    return () => {
      if (abortFetchEnabledRef.current) {
        controller.abort();
      }
      clearTimeout(timer);
    };
  }, [fetchMutualsCount]); // fetchMutualsCount is now a dependency

  useEffect(() => {
    const firstName = normalize(user.first_name);
    const lastName = normalize(user.last_name);
    const terms = normalize(query).split(" ");

    const userMatches =
      (firstName.substring(0, terms[0].length) === terms[0] ||
        lastName.substring(0, terms[0].length) === terms[0]) &&
      (!terms[1] ||
        firstName.substring(0, terms[1].length) === terms[1] ||
        lastName.substring(0, terms[1].length) === terms[1]);

    setIsShown(userMatches);
  }, [query, user.first_name, user.last_name]);

  function normalize(str) {
    return str.trim().replace(/ +/g, " ").toLowerCase();
  }

  return (
    <div className={"ProfileFriendItem" + (isShown ? "" : " hidden")}>
      <Link to={`/profile/${user._id}`}>
        {media(user.pfp || blankUser, { size: "s" })}
      </Link>
      <div className="text">
        <Link to={`/profile/${user._id}`} className="full-name">
          {`${user.first_name} ${user.last_name}`}
        </Link>
        {mutualCount ? (
          <Link
            to={`/profile/${user._id}/friends`}
            className="mutual-friend-count"
          >
            {mutualCount === 1
              ? "1 mutual friend"
              : mutualCount + " mutual friends"}
          </Link>
        ) : null}
      </div>
      {<RelationshipBtn userId={user._id} />}
    </div>
  );
}

export default ProfileFriendItem;
