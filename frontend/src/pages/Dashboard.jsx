import React, { useEffect, useState, useRef } from 'react'
import api from '../utils/api'
import UploadForm from '../components/UploadForm'
import VideoCard from '../components/VideoCard'
import { io } from 'socket.io-client'

export default function Dashboard() {
	const [videos, setVideos] = useState([])
	const socketRef = useRef(null)

	// fetch initial videos
	const fetchVideos = async () => {
		try {
			const res = await api.get('/api/videos')
			setVideos(res.data)
		} catch (err) {
			console.error('Failed to fetch videos', err)
		}
	}

	useEffect(() => {
		fetchVideos()

		const token = localStorage.getItem('token')
		if (!token) return

		// connect socket
		const socket = io('http://localhost:5000', { auth: { token } })
		socketRef.current = socket

		socket.on('connect', () => console.log('socket connected', socket.id))

		// when server emits processingUpdate, update that video in state
		socket.on('processingUpdate', data => {
			setVideos(prev => prev.map(v => v._id === data.videoId ? { ...v, processingProgress: data.progress, status: 'processing' } : v))
		})

		socket.on('processingComplete', data => {
			// update video status & result
			setVideos(prev => prev.map(v => v._id === data.videoId ? { ...v, status: data.status, result: data.result, processingProgress: 100 } : v))
		})

		return () => {
			socket.disconnect()
		}
	}, [])

	const handleUploaded = (video) => {
		// join the socket room for this video so we get updates
		socketRef.current?.emit('subscribeVideo', { videoId: video._id })
		// add to list
		setVideos(prev => [video, ...prev])
	}

	// subscribe to existing videos on load
	useEffect(() => {
		const token = localStorage.getItem('token')
		if (!token) return
		// after videos are loaded, subscribe to their rooms
		videos.forEach(v => socketRef.current?.emit('subscribeVideo', { videoId: v._id }))
	}, [videos.length])

	return (
		<div>
			<UploadForm onUploaded={handleUploaded} />

			<div className="mb-4">
				<h3 className="text-lg font-semibold mb-2">Your Videos</h3>
				{videos.length === 0 && <div className="text-sm text-gray-500">No videos yet</div>}
				{videos.map(v => <VideoCard key={v._id} v={v} />)}
			</div>

			<div className="mt-6 text-sm text-gray-600">
				<strong>Notes:</strong> The app connects to the backend at <code>http://localhost:5000</code>. Make sure your backend is running.
			</div>
		</div>
	)
}