import { useEffect, useState } from "react"
import moment from 'moment'
import {FaThumbsUp} from 'react-icons/fa'
import { useSelector } from "react-redux"
import {Button, Textarea} from 'flowbite-react'
import {getAccessTokenFromCookie} from "../authUtils"

export default function Comment({comment, onLike, onEdit, onDelete}) {
    const [user, setUser] = useState({})
    const [isEditing, setIsEditing] = useState(false)
    const [editedContent, setEditedContent] = useState(comment.content)
    const {currentUser} = useSelector((state) => state.user)
    const BE_API = import.meta.env.VITE_BE_API_URL;
    const token = getAccessTokenFromCookie();
    
    useEffect(() => {
        const getUser = async () => {
            try {
                const res = await fetch(`${BE_API}api/user/${comment.userId}`)
                const data = await res.json()
                if(res.ok){
                    setUser(data)
                }
            } catch (error) {
                console.log(error.message)
            }
        }
        getUser()
    },[comment])

    const handleEdit = async () => {
        setIsEditing(true)
        setEditedContent(comment.content)
    }

    const handleSave = async() => {
        try {
            const res = await fetch(`${BE_API}api/comment/editcomment/${comment._id}`, {
                method: "PUT",
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: editedContent
                })
            })
            if(res.ok){
                setIsEditing(false)
                onEdit(comment, editedContent)
            }
        } catch (error) {
            console.log(error.message)
        }
    }
  return (
    <div className="flex p-4 border-b dark:border-gray-600 text-sm">
        <div className="flex-shirk-0 mr-3">
            <img className="w-10 h-10 rounded-full bg-gray-200" src={user.profilePicture} alt={user.username}/>
        </div>
        <div className="flex-1">
            <div className="flex items-center mb-1">
                <span className="font-bold mr-1 text-sm truncate">{user ? `@${user.username}` : 'anonymous user'}</span>
                <span className="text-xs text-gray-500">{moment(comment.createdAt).fromNow()}</span>
            </div>
            {
                isEditing ? (
                    <>
                    <Textarea 
                        className="mb-2"
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                    />
                    <div className="flex justify-end gap-2 text-xs">
                        <Button type="button" size='sm' gradientDuoTone='tealToLime' onClick={handleSave}>
                            Save
                        </Button>
                        <Button type="button" size='sm' gradientDuoTone='tealToLime' outline onClick={() => setIsEditing(false)}>
                            Cancel
                        </Button>
                    </div>
                    </>
                ): (
                    <>
                    <p className="text-gray-500 pb-2">{comment.content}</p>
                    <div className="flex items-center pt-2 text-xs border-t dark:text-gray-700 max-w-fit gap-2">
                        <button 
                            type="button" 
                            onClick={() => onLike(comment._id)} 
                            className={`text-gray-400 hover:text-blue-500 ${ currentUser && comment.likes.includes(currentUser._id) && '!text-blue-500'}`}
                        >
                            <FaThumbsUp className="text-sm"/>
                        </button>
                        <p className="text-gray-400">
                            {
                                comment.numberOfLikes > 0 && comment.numberOfLikes + " " + (comment.numberOfLikes === 1 ? "like" : "likes")
                            }
                        </p>
                        {
                            currentUser && (currentUser._id === comment.userId || currentUser.isAdmin) && (
                                <>
                                <button onClick={handleEdit} type="button" className="text-gray-400 hover:text-blue-500">
                                    Edit
                                </button>
                                <button onClick={() => onDelete(comment._id)} type="button" className="text-gray-400 hover:text-red-500">
                                    Detele
                                </button>
                                </>
                            )
                        }
                    </div>
                    </>
                )
            }
        </div>
    </div>
  )
}
