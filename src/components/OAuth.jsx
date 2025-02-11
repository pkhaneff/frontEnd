import { Button } from "flowbite-react";
import { AiFillGooglePlusCircle } from "react-icons/ai";
import {getAuth, GoogleAuthProvider, signInWithPopup} from 'firebase/auth'
import { app } from "../firebase";
import { useDispatch } from "react-redux";
import { SignInSuccess } from "../redux/user/userSlice";
import { useNavigate } from "react-router-dom";
import { getAccessTokenFromCookie } from '../authUtils'

export default function OAuth() {
    const auth = getAuth(app)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const token = getAccessTokenFromCookie()
    const BE_API = import.meta.env.VITE_BE_API_URL;

    const handleGoogleClick = async () =>{
        const provider = new GoogleAuthProvider()
        provider.setCustomParameters({ prompt: 'select_account' })
        try {
            const resultsFromGoogle = await signInWithPopup(auth, provider)
            const res = await fetch(`${BE_API}api/auth/google`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, 
                },
                body: JSON.stringify({
                    name: resultsFromGoogle.user.displayName,
                    email: resultsFromGoogle.user.email,
                    googlePhotoUrl: resultsFromGoogle.user.photoURL,
                }),
            })
            const data = await res.json()
            if (res.ok){
                dispatch(SignInSuccess(data))
                navigate('/')
            }
        } catch (error) {
            console.log(error);
        }
    } 
  return (
    <Button type="button" gradientDuoTone='tealToLime' outline onClick={handleGoogleClick}>
        <AiFillGooglePlusCircle className="w-6 h-6 mr-2"/>
        Continue with Google
    </Button>
  )
}
