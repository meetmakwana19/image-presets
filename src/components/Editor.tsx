import React from 'react'
import { useState } from 'react'
import ReactCrop, { Crop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { GrRotateLeft, GrRotateRight } from 'react-icons/gr'
import { CgMergeVertical, CgMergeHorizontal } from 'react-icons/cg'
import { IoMdUndo, IoMdRedo, IoIosImage } from 'react-icons/io'
import storeData from './LinkedList';
import "./Editor.css";
import { IState } from "./types";
import { dataURItoBlob } from './common/utils'
import "./switch.css"

const Editor = () => {
    const filterElement: Array<{ name: string; maxValue?: number }> = [
        {
            name: 'brightness',
            maxValue: 200
        },
        // {
        //     name: 'grayscale',
        //     maxValue: 100
        // },
        // {
        //     name: 'sepia',
        //     maxValue: 100
        // },
        {
            name: 'saturate',
            maxValue: 200
        },
        {
            name: 'contrast',
            maxValue: 200
        },
        {
            name: 'hueRotate',
            maxValue: 360,
        }
    ]
    const [property, setProperty] = useState<{ name: string; maxValue?: number }>(
        {
            name: 'brightness',
            maxValue: 200
        }
    )
    const [details, setDetails] = useState<HTMLImageElement | string | null>('')
    const [crop, setCrop] = useState<Crop>({ unit: '%', width: 100, x: 0, y: 0, height: 100 })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [state, setState] = useState<IState & { [key: string]: any }>({
        image: '',
        brightness: 100,
        grayscale: 0,
        sepia: 0,
        saturate: 100,
        contrast: 100,
        hueRotate: 0,
        rotate: 0,
        vertical: 1,
        horizontal: 1
    })
    console.log("state is ----- ", state);
    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
    console.log("imageDimensions is ----- ", imageDimensions);

    const handleReset = () => {
        setState({
            ...state,
            brightness: 100,
            grayscale: 0,
            sepia: 0,
            saturate: 100,
            contrast: 100,
            hueRotate: 0,
            rotate: 0,
            vertical: 1,
            horizontal: 1
        })
    }
    const inputHandle = (e: React.ChangeEvent<HTMLInputElement>) => {
        setState({
            ...state,
            [e.target.name]: +e.target.value
        })
    }
    const handleSwitchToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setState({
                ...state,
                grayscale: 100
            })
        } else {
            setState({
                ...state,
                grayscale: 0
            })
        }
    }
    const leftRotate = () => {
        setState({
            ...state,
            rotate: state.rotate - 90
        })

        const stateData = state
        stateData.rotate = state.rotate - 90
        storeData.insert(stateData)
    }

    const rightRotate = () => {
        setState({
            ...state,
            rotate: state.rotate + 90
        })
        const stateData = state
        stateData.rotate = state.rotate + 90
        storeData.insert(stateData)
    }
    const verticalFlip = () => {
        setState({
            ...state,
            vertical: state.vertical === 1 ? -1 : 1
        })
        const stateData = state
        stateData.vertical = state.vertical === 1 ? -1 : 1
        storeData.insert(stateData)
    }

    const horizontalFlip = () => {
        setState({
            ...state,
            horizontal: state.horizontal === 1 ? -1 : 1
        })
        const stateData = state
        stateData.horizontal = state.horizontal === 1 ? -1 : 1
        storeData.insert(stateData)
    }

    const redo = () => {
        const data = storeData.redoEdit() as IState;
        if (data) {
            setState(data)
        }
    }
    const undo = () => {
        const data = storeData.undoEdit() as IState;

        if (data) {
            setState(data)
        }
    }
    const imageHandle = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files?.length !== 0) {

            const reader = new FileReader()

            reader.onload = () => {
                setState({
                    ...state,
                    image: reader.result
                })

                const stateData = {
                    image: reader.result,
                    brightness: 100,
                    grayscale: 0,
                    sepia: 0,
                    saturate: 100,
                    contrast: 100,
                    hueRotate: 0,
                    rotate: 0,
                    vertical: 1,
                    horizontal: 1
                }
                storeData.insert(stateData)
            }
            reader.readAsDataURL(e.target.files[0])
        }
    }
    const imageCrop = () => {
        const canvas = document.createElement('canvas')
        const scaleX = (details as HTMLImageElement)?.naturalWidth / (details as HTMLImageElement)?.width;
        const scaleY = (details as HTMLImageElement)?.naturalHeight / (details as HTMLImageElement)?.height
        canvas.width = crop.width
        canvas.height = crop.height
        const ctx = canvas.getContext('2d')

        ctx?.drawImage(
            details as HTMLImageElement,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width,
            crop.height
        )

        const base64Url = canvas.toDataURL('image/jpg')

        setState({
            ...state,
            image: base64Url
        })
    }
    const saveImage = () => {
        const canvas = document.createElement('canvas')
        canvas.width = (details as HTMLImageElement)?.naturalWidth
        canvas.height = (details as HTMLImageElement)?.naturalHeight
        const ctx = canvas.getContext('2d')

        ctx!.filter = `brightness(${state.brightness}%) brightness(${state.brightness}%) sepia(${state.sepia}%) saturate(${state.saturate}%) contrast(${state.contrast}%) grayscale(${state.grayscale}%) hue-rotate(${state.hueRotate}deg)`

        ctx?.translate(canvas.width / 2, canvas.height / 2)
        ctx?.rotate(state.rotate * Math.PI / 180)
        // ctx?.scale(state.vertical, state.horizontal)

        ctx?.drawImage(
            details as HTMLImageElement,
            -canvas.width / 2,
            -canvas.height / 2,
            canvas.width,
            canvas.height
        )

        // Since we already have the original file from input, we don't need to manipulate it on the frontend
        const blob = dataURItoBlob(String(state.image));  // Convert data URL to Blob

        const transformationData = {
            rotate: state.rotate,
            flipHorizontal: state.horizontal === -1 ? true : false,
            flipVertical: state.vertical === -1 ? true : false,
            brightness: state.brightness,
            grayscale: state.grayscale,
            sepia: state.sepia,
            saturate: state.saturate,
            contrast: state.contrast,
            hueRotate: state.hueRotate,
            crop: {
                x: crop.x,
                y: crop.y,
                width: crop.width,
                height: crop.height,
            }
        };
        // Create a FormData object and append the image blob
        const formData = new FormData();

        // Append the image with the original name from user input
        formData.append('image', blob, 'og-image.png');
        formData.append('transformations', JSON.stringify(transformationData));

        // Post request with FormData
        fetch('http://localhost:8000/image-presets', {
            method: 'POST',
            body: formData,
        })
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                console.log('Image saved successfully:', data);
            })
            .catch((error) => {
                console.error('Error saving image:', error);
            });


        const link = document.createElement('a')
        link.download = 'image_edit.jpg'
        link.href = canvas.toDataURL()
        link.click()
    }
    return (
        <div className='image_editor'>
            <div className="card">
                <div className="card_header">
                    <h2>Image Editor</h2>
                </div>
                <div className="card_body">

                    <div className="image_section">
                        <div className="image">
                            {
                                state.image ? <ReactCrop crop={crop} onChange={c =>
                                    setCrop(c)
                                }>
                                    <img onLoad={(e) => {

                                        const { naturalWidth, naturalHeight } = e.currentTarget;
                                        setImageDimensions({
                                            width: naturalWidth,
                                            height: naturalHeight
                                        });
                                        setDetails(e.currentTarget)
                                    }} style={{ filter: `brightness(${state.brightness}%) brightness(${state.brightness}%) sepia(${state.sepia}%) saturate(${state.saturate}%) contrast(${state.contrast}%) grayscale(${state.grayscale}%) hue-rotate(${state.hueRotate}deg)`, transform: `rotate(${state.rotate}deg) scale(${state.vertical},${state.horizontal})` }} src={state.image as string} alt="" />
                                </ReactCrop> :
                                    <label htmlFor="choose">
                                        <IoIosImage />
                                        <span>Choose Image</span>
                                    </label>
                            }
                        </div>
                        <div className="image_select">
                            <label htmlFor="choose">Choose Image</label>
                            <input onChange={imageHandle} type="file" id='choose' />
                            {
                                crop && <button onClick={imageCrop} className='crop'>Crop Image</button>
                            }
                            <button onClick={undo} className='undo'><IoMdUndo /></button>
                            <button onClick={redo} className='redo'><IoMdRedo /></button>
                        </div>
                    </div>
                    <div className="sidebar">
                        <div className="side_body">
                            <div className="rotate">
                                <label htmlFor="">Rotate & Filp</label>
                                <div className="icon">
                                    <div onClick={leftRotate}><GrRotateLeft /></div>
                                    <div onClick={rightRotate}><GrRotateRight /></div>
                                    <div onClick={verticalFlip}><CgMergeVertical /></div>
                                    <div onClick={horizontalFlip}><CgMergeHorizontal /></div>
                                </div>
                            </div>
                            <div className="filter_slider">
                                <div className="label_bar">
                                    <label htmlFor="range">Filter adjustment</label>
                                    <span>{state[property.name]}{property.name !== "hueRotate" ? "%" : "˚"}</span>
                                </div>
                                <input name={property.name} onChange={inputHandle} value={state[property.name]} max={property.maxValue} type="range" />
                            </div>
                            <div className="filter_section">
                                <span>Filters</span>
                                <div className="filter_key">
                                    {
                                        filterElement.map((v, i) => <button className={property.name === v.name ? 'active' : ''} onClick={() => setProperty(v)} key={i} >{v.name}</button>)
                                    }
                                </div>
                                <div className="bw-toggle">
                                    B/W filter
                                    <label className="switch">
                                        <input type="checkbox" onChange={handleSwitchToggle} />
                                        <span className="slider round"></span>
                                    </label>

                                </div>
                            </div>


                        </div>
                        <div className="action-buttons">
                            <button className='reset' onClick={handleReset}>Reset</button>
                            <button onClick={saveImage} className='save'>Save Image</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Editor