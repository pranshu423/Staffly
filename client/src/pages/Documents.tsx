import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, FileText, Download, Trash2, File, Image as ImageIcon } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

interface Document {
    _id: string;
    title: string;
    description?: string;
    fileName: string;
    filePath: string;
    fileType: string;
    fileSize: number;
    uploadedBy: {
        _id: string;
        name: string;
    };
    createdAt: string;
}

const Documents = () => {
    const { user } = useAuth();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    // Upload Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isPublic, setIsPublic] = useState(false);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const { data } = await axios.get(`${apiUrl}/api/documents`, { withCredentials: true });
            setDocuments(data);
        } catch (error) {
            console.error('Failed to fetch documents', error);
            toast.error('Failed to load documents');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            toast.error('Please select a file');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('file', file);
        formData.append('isPublic', isPublic.toString());

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const { data } = await axios.post(`${apiUrl}/api/documents`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true
            });

            setDocuments([data, ...documents]);
            setIsUploadModalOpen(false);
            setTitle('');
            setDescription('');
            setFile(null);
            setIsPublic(false);
            toast.success('Document uploaded successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Upload failed');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this document?')) return;

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.delete(`${apiUrl}/api/documents/${id}`, { withCredentials: true });
            setDocuments(documents.filter(doc => doc._id !== id));
            toast.success('Document deleted');
        } catch (error: any) {
            toast.error('Failed to delete document');
        }
    };

    const getFileIcon = (mimeType: string) => {
        if (mimeType.startsWith('image/')) return <ImageIcon className="w-8 h-8 text-purple-500" />;
        if (mimeType === 'application/pdf') return <FileText className="w-8 h-8 text-red-500" />;
        return <File className="w-8 h-8 text-blue-500" />;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="h-full flex flex-col">
            <Toaster richColors position="top-right" />

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Document Vault</h1>
                    <p className="text-slate-500 font-medium">Securely screen and manage your files</p>
                </div>
                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Upload Document
                </button>
            </div>

            {/* Document Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {documents.map((doc) => (
                    <div key={doc._id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-blue-50 transition-colors">
                                {getFileIcon(doc.fileType)}
                            </div>
                            {(user?.role === 'admin' || user?._id === doc.uploadedBy._id) && (
                                <button
                                    onClick={() => handleDelete(doc._id)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <h3 className="font-bold text-slate-800 truncate mb-1" title={doc.title}>{doc.title}</h3>
                        <p className="text-xs text-slate-500 mb-4 line-clamp-2 min-h-[2.5em]">
                            {doc.description || 'No description'}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-bold text-slate-400">Size</span>
                                <span className="text-xs font-bold text-slate-600">{formatFileSize(doc.fileSize)}</span>
                            </div>
                            <a
                                href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${doc.filePath}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                                <Download className="w-3.5 h-3.5" />
                                Download
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            {documents.length === 0 && !isLoading && (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                    <div className="p-6 bg-slate-50 rounded-full mb-4">
                        <FileText className="w-12 h-12 text-slate-300" />
                    </div>
                    <p className="font-bold text-lg text-slate-600">No documents yet</p>
                    <p className="text-sm">Upload your first document to get started</p>
                </div>
            )}

            {/* Upload Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Upload Document</h2>
                        <form onSubmit={handleUpload} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                                    placeholder="e.g., Employment Contract"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                                <textarea
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-medium resize-none"
                                    placeholder="Optional description..."
                                    rows={3}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">File</label>
                                <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-400 transition-colors bg-slate-50">
                                    <input
                                        type="file"
                                        required
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                                    />
                                    <div className="flex flex-col items-center pointer-events-none">
                                        <Plus className="w-8 h-8 text-slate-400 mb-2" />
                                        <span className="text-sm font-bold text-slate-600">
                                            {file ? file.name : 'Click to select file'}
                                        </span>
                                        <span className="text-xs text-slate-400 mt-1">PDF, Images, Docs</span>
                                    </div>
                                </div>
                            </div>

                            {user?.role === 'admin' && (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="isPublic"
                                        checked={isPublic}
                                        onChange={(e) => setIsPublic(e.target.checked)}
                                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="isPublic" className="text-sm font-medium text-slate-700">
                                        Visible to everyone?
                                    </label>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsUploadModalOpen(false)}
                                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors shadow-lg shadow-slate-900/20"
                                >
                                    Upload
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Documents;
