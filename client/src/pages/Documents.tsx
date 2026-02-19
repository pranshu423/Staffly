import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, FileText, Download, Plus, Image as ImageIcon, File } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

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

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Document Vault</h1>
                    <p className="text-slate-300 font-medium text-lg">Securely screen and manage your files</p>
                </div>
                <Button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 border border-white/10 transition-all hover:-translate-y-0.5"
                >
                    <Plus className="w-5 h-5" />
                    Upload Document
                </Button>
            </div>

            {/* Document Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {documents.map((doc) => (
                    <div key={doc._id} className="glass-card p-6 !rounded-3xl hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10 transition-all group relative overflow-hidden bg-slate-900/40">
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="flex items-start justify-between mb-5">
                            <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-blue-500/10 transition-colors shadow-inner border border-white/5">
                                {getFileIcon(doc.fileType)}
                            </div>
                            {(user?.role === 'admin' || user?._id === doc.uploadedBy._id) && (
                                <button
                                    onClick={() => handleDelete(doc._id)}
                                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <h3 className="font-bold text-white text-lg truncate mb-1 tracking-tight" title={doc.title}>{doc.title}</h3>
                        <p className="text-xs text-slate-400 mb-6 line-clamp-2 min-h-[2.5em] font-medium leading-relaxed">
                            {doc.description || 'No description provided'}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Size</span>
                                <span className="text-xs font-bold text-slate-300">{formatFileSize(doc.fileSize)}</span>
                            </div>
                            <a
                                href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${doc.filePath}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-xs font-bold text-blue-300 bg-blue-500/10 px-4 py-2 rounded-xl hover:bg-blue-500/20 transition-all border border-blue-500/20 hover:border-blue-500/40"
                            >
                                <Download className="w-3.5 h-3.5" />
                                Download
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            {documents.length === 0 && !isLoading && (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 mt-12 animate-in fade-in zoom-in duration-500">
                    <div className="p-8 bg-white/5 rounded-full mb-6 border border-white/10 shadow-xl">
                        <FileText className="w-16 h-16 text-slate-500" />
                    </div>
                    <p className="font-bold text-xl text-white mb-2">No documents yet</p>
                    <p className="text-slate-400">Upload your first document to get started</p>
                </div>
            )}

            {/* Upload Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="glass-card !bg-slate-900/90 rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300 border border-white/10 relative">
                        <button
                            onClick={() => setIsUploadModalOpen(false)}
                            className="absolute top-6 right-6 text-slate-400 hover:text-white bg-white/5 p-2 rounded-full hover:bg-white/10 transition-colors"
                        >
                            <Plus className="w-5 h-5 rotate-45" />
                        </button>

                        <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Upload Document</h2>
                        <form onSubmit={handleUpload} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2 ml-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium text-white placeholder:text-slate-500 hover:bg-white/10 transition-colors outline-none"
                                    placeholder="e.g., Employment Contract"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2 ml-1">Description</label>
                                <textarea
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium text-white placeholder:text-slate-500 resize-none hover:bg-white/10 transition-colors outline-none"
                                    placeholder="Optional description..."
                                    rows={3}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2 ml-1">File</label>
                                <div className="relative border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-blue-500/50 transition-all bg-white/5 hover:bg-white/10 group cursor-pointer">
                                    <input
                                        type="file"
                                        required
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                                    />
                                    <div className="flex flex-col items-center pointer-events-none">
                                        <div className="p-3 bg-blue-500/10 rounded-full mb-3 group-hover:scale-110 transition-transform">
                                            <Plus className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <span className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                                            {file ? file.name : 'Click to select file'}
                                        </span>
                                        <span className="text-xs text-slate-500 mt-1">PDF, Images, Docs</span>
                                    </div>
                                </div>
                            </div>

                            {user?.role === 'admin' && (
                                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                                    <input
                                        type="checkbox"
                                        id="isPublic"
                                        checked={isPublic}
                                        onChange={(e) => setIsPublic(e.target.checked)}
                                        className="w-5 h-5 rounded border-white/20 bg-white/10 text-blue-600 focus:ring-blue-500 checked:bg-blue-500"
                                    />
                                    <label htmlFor="isPublic" className="text-sm font-bold text-slate-300 cursor-pointer select-none">
                                        Visible to everyone?
                                    </label>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsUploadModalOpen(false)}
                                    className="flex-1 py-3.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-bold transition-colors border border-white/10"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5"
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
