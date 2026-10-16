// 과학 탐험 노트 - Windows 데스크톱 실행 파일
// 화면(index.html)과 WebView2 라이브러리를 exe 안에 넣어 두고, 실행할 때 %LOCALAPPDATA%\ScienceNote 에 풀어서 씁니다.
using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Reflection;
using System.Runtime.CompilerServices;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

[assembly: AssemblyTitle("과학 탐험 노트")]
[assembly: AssemblyProduct("과학 탐험 노트")]
[assembly: AssemblyDescription("초등 5학년 과학을 놀이 실험과 퀴즈로 배우기")]
[assembly: AssemblyVersion("1.0.0.0")]
[assembly: AssemblyFileVersion("1.0.0.0")]

static class Program
{
    static string appDir, binDir, webDir;

    [STAThread]
    static void Main()
    {
        appDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "ScienceNote");
        binDir = Path.Combine(appDir, "bin");
        webDir = Path.Combine(appDir, "web");
        Directory.CreateDirectory(binDir);
        Directory.CreateDirectory(webDir);

        Extract("Microsoft.Web.WebView2.Core.dll", binDir);
        Extract("Microsoft.Web.WebView2.WinForms.dll", binDir);
        Extract("WebView2Loader.dll", binDir);
        Extract("index.html", webDir);

        AppDomain.CurrentDomain.AssemblyResolve += delegate (object s, ResolveEventArgs e)
        {
            string p = Path.Combine(binDir, new AssemblyName(e.Name).Name + ".dll");
            return File.Exists(p) ? Assembly.LoadFrom(p) : null;
        };

        Application.EnableVisualStyles();
        Application.SetCompatibleTextRenderingDefault(false);
        Run();
    }

    // WebView2 형식은 AssemblyResolve 등록 뒤에 불러와야 하므로 별도 메서드로 분리
    [MethodImpl(MethodImplOptions.NoInlining)]
    static void Run()
    {
        Application.ThreadException += delegate (object s, System.Threading.ThreadExceptionEventArgs e) { MainForm.Log("처리 안 된 오류: " + e.Exception); };
        AppDomain.CurrentDomain.UnhandledException += delegate (object s, UnhandledExceptionEventArgs e) { MainForm.Log("처리 안 된 오류: " + e.ExceptionObject); };
        MainForm.LogPath = Path.Combine(appDir, "error.log");
        MainForm.Log("시작");
        Application.Run(new MainForm(appDir, binDir, webDir));
        MainForm.Log("정상 종료");
    }

    static void Extract(string name, string dir)
    {
        string target = Path.Combine(dir, name);
        using (Stream src = Assembly.GetExecutingAssembly().GetManifestResourceStream(name))
        {
            if (src == null) return;
            try
            {
                if (File.Exists(target) && new FileInfo(target).Length == src.Length && !name.EndsWith(".html")) return;
                using (FileStream dst = File.Create(target)) src.CopyTo(dst);
            }
            catch (IOException) { /* 다른 창이 이미 실행 중이면 기존 파일을 그대로 씀 */ }
        }
    }
}

class MainForm : Form
{
    public static string LogPath;
    // 문제가 생기면 %LOCALAPPDATA%\ScienceNote\error.log 에 남긴다
    public static void Log(string msg)
    {
        if (LogPath == null) return;
        try
        {
            if (File.Exists(LogPath) && new FileInfo(LogPath).Length > 200000) File.Delete(LogPath);
            File.AppendAllText(LogPath, DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss") + " " + msg + "\r\n");
        }
        catch { }
    }
    readonly WebView2 view = new WebView2();
    readonly string appDir, binDir, webDir;

    public MainForm(string appDir, string binDir, string webDir)
    {
        this.appDir = appDir; this.binDir = binDir; this.webDir = webDir;
        Text = Application.ProductName;
        ClientSize = new Size(1000, 820);
        MinimumSize = new Size(440, 620);
        StartPosition = FormStartPosition.CenterScreen;
        BackColor = Color.FromArgb(246, 249, 252);
        try { Icon = Icon.ExtractAssociatedIcon(Application.ExecutablePath); } catch { }
        view.Dock = DockStyle.Fill;
        view.DefaultBackgroundColor = BackColor;
        Controls.Add(view);
        Load += delegate { Init(); };
    }

    async void Init()
    {
        try
        {
            CoreWebView2Environment.SetLoaderDllFolderPath(binDir);
            CoreWebView2Environment env = await CoreWebView2Environment.CreateAsync(null, Path.Combine(appDir, "WebView2Data"), null);
            await view.EnsureCoreWebView2Async(env);
            CoreWebView2 core = view.CoreWebView2;
            core.Settings.AreDevToolsEnabled = false;
            core.Settings.IsStatusBarEnabled = false;
            core.Settings.AreDefaultContextMenusEnabled = false;
            core.Settings.IsZoomControlEnabled = true;
            core.DocumentTitleChanged += delegate { Text = core.DocumentTitle; };
            core.NewWindowRequested += delegate (object s, CoreWebView2NewWindowRequestedEventArgs e)
            {
                e.Handled = true;
                try { Process.Start(e.Uri); } catch { }
            };
            core.ProcessFailed += delegate (object s, CoreWebView2ProcessFailedEventArgs e) { Log("WebView2 프로세스 오류: " + e.ProcessFailedKind); };
            core.NavigationCompleted += delegate (object s, CoreWebView2NavigationCompletedEventArgs e) { if (!e.IsSuccess) Log("화면 열기 실패: " + e.WebErrorStatus); };
            // 회사 보안이 가상 호스트 주소를 막는 경우가 있어 파일 주소(file://)로 연다
            view.Source = new Uri(Path.Combine(webDir, "index.html"));
        }
        catch (Exception ex)
        {
            Log("시작 실패: " + ex);
            DialogResult r = MessageBox.Show(
                "화면을 표시하는 Microsoft Edge WebView2 런타임을 찾지 못했어요.\n" +
                "Windows 10/11에는 보통 들어 있어요. [예]를 누르면 설치 페이지를 열어요.\n\n(" + ex.Message + ")",
                Application.ProductName, MessageBoxButtons.YesNo, MessageBoxIcon.Warning);
            if (r == DialogResult.Yes)
            {
                try { Process.Start("https://developer.microsoft.com/microsoft-edge/webview2/"); } catch { }
            }
            Close();
        }
    }
}
