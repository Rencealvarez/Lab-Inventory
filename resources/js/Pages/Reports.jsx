import {
    FileText,
    Download,
    Printer,
    Package,
    ArrowLeftRight,
    Wrench,
    Activity
} from 'lucide-react';

import LabLayout from '@/Layouts/LabLayout';

export default function Reports() {
    const reportsList = [
        {
            id: 'inv',
            title: 'Inventory Report',
            description: 'Comprehensive overview of all items, stock levels, and their current status across all facilities.',
            icon: Package,
            color: 'bg-blue-100 text-blue-600 border-blue-200',
            pdfRoute: 'reports.inventory',
        },
        {
            id: 'trx',
            title: 'Transaction Report',
            description: 'Detailed log of all borrowing and returning activities including overdue alerts.',
            icon: ArrowLeftRight,
            color: 'bg-green-100 text-green-600 border-green-200',
            pdfRoute: 'reports.transactions',
        },
        {
            id: 'mtn',
            title: 'Maintenance Report',
            description: 'Historical data on all reported incidents, repair costs, and resolution statuses.',
            icon: Wrench,
            color: 'bg-orange-100 text-orange-600 border-orange-200',
            pdfRoute: 'reports.maintenance',
        },
        {
            id: 'usg',
            title: 'Lab Usage Report',
            description: 'Analytics on facility occupancy rates, peak hours, and overall utilization.',
            icon: Activity,
            color: 'bg-purple-100 text-purple-600 border-purple-200',
            pdfRoute: null,
        },
    ];

    const openReportPdf = (routeName) => {
        if (!routeName) return;
        window.open(route(routeName), '_blank');
    };

    return (
        <LabLayout title="Reports">
            <div className="flex-1 overflow-auto p-8">
                <div className="mx-auto w-full max-w-[1100px]">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="flex h-[42px] w-[42px] items-center justify-center rounded-lg bg-white border border-[#d2deeb] text-gray-600 shadow-sm">
                                <FileText className="h-[22px] w-[22px]" strokeWidth={1.5} />
                            </div>
                            <div>
                                <h1 className="text-[22px] font-bold text-gray-800 tracking-tight">System Reports</h1>
                                <p className="text-gray-500 text-sm mt-0.5">Generate and print PDF reports</p>
                            </div>
                        </div>
                    </div>

                    {/* Reports Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {reportsList.map((report) => {
                            const Icon = report.icon;
                            return (
                                <div key={report.id} className="bg-white rounded-xl shadow-sm border border-[#e1f1fd] p-6 hover:shadow-md transition-shadow flex flex-col h-full">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className={`p-3 rounded-lg border flex-shrink-0 ${report.color}`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-800 tracking-tight mb-1">{report.title}</h3>
                                            <p className="text-[13px] text-gray-500 leading-relaxed">{report.description}</p>
                                        </div>
                                    </div>
                                    <div className="mt-auto pt-5 border-t border-[#f1f5f9] flex items-center justify-end gap-3">
                                        <button
                                            type="button"
                                            disabled={!report.pdfRoute}
                                            onClick={() => openReportPdf(report.pdfRoute)}
                                            title={report.pdfRoute ? 'Open printable PDF' : 'Not available yet'}
                                            className="flex items-center gap-2 rounded-lg border border-[#d2deeb] bg-white px-4 py-2 text-[13px] font-semibold text-gray-600 shadow-sm hover:bg-gray-50 hover:text-gray-800 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <Printer className="h-4 w-4" />
                                            Print
                                        </button>
                                        <button
                                            type="button"
                                            disabled={!report.pdfRoute}
                                            onClick={() => openReportPdf(report.pdfRoute)}
                                            title={report.pdfRoute ? 'Download / view PDF' : 'Not available yet'}
                                            className="flex items-center gap-2 rounded-lg bg-[#1e293b] px-4 py-2 text-[13px] font-semibold text-white shadow-sm hover:bg-gray-800 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <Download className="h-4 w-4" />
                                            Export PDF
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </LabLayout>
    );
}
